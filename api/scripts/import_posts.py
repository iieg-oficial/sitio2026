import argparse
import csv
import json
import re
import sys
from datetime import datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

from slugify import slugify
from sqlalchemy import select

sys.path.append(str(Path(__file__).parent.parent))

from app.core.database import SessionLocal
from app.models import Posts, Subject, GalleryImage


class TipTapHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.doc_content: list[dict] = []
        self.block_stack: list[tuple[str, dict]] = []
        self.mark_stack: list[tuple[str, dict]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs_dict = dict(attrs)
        tag = tag.lower()

        if tag in {"p", "ul", "ol", "li"} or re.fullmatch(r"h[1-6]", tag):
            self._push_block(tag, attrs_dict)
            return

        if tag in {"strong", "b"}:
            self.mark_stack.append((tag, {"type": "bold"}))
            return

        if tag in {"em", "i"}:
            self.mark_stack.append((tag, {"type": "italic"}))
            return

        if tag == "a":
            href = attrs_dict.get("href")
            if href:
                self.mark_stack.append((tag, {"type": "link", "attrs": {"href": href}}))
            return

        if tag == "br":
            self._append_inline({"type": "hardBreak"})

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()

        if tag in {"strong", "b", "em", "i", "a"}:
            for idx in range(len(self.mark_stack) - 1, -1, -1):
                if self.mark_stack[idx][0] == tag:
                    self.mark_stack.pop(idx)
                    break
            return

        if tag in {"p", "ul", "ol", "li"} or re.fullmatch(r"h[1-6]", tag):
            self._close_block(tag)

    def handle_data(self, data: str) -> None:
        text = re.sub(r"\s+", " ", unescape(data))
        if not text.strip():
            return

        text_node: dict = {"type": "text", "text": text}
        if self.mark_stack:
            text_node["marks"] = [mark for _, mark in self.mark_stack]
        self._append_inline(text_node)

    def close_open_blocks(self) -> None:
        while self.block_stack:
            self._close_block(self.block_stack[-1][0])

    def to_doc(self) -> dict:
        self.close_open_blocks()
        if not self.doc_content:
            self.doc_content.append(
                {
                    "type": "paragraph",
                    "content": [{"type": "text", "text": ""}],
                }
            )
        return {"type": "doc", "content": self.doc_content}

    def _push_block(self, tag: str, attrs_dict: dict) -> None:
        if re.fullmatch(r"h[1-6]", tag):
            node = {"type": "heading", "attrs": {"level": int(tag[1])}, "content": []}
        elif tag == "p":
            node = {"type": "paragraph", "content": []}
        elif tag == "ul":
            node = {"type": "bulletList", "content": []}
        elif tag == "ol":
            node = {"type": "orderedList", "content": []}
        else:  # li
            node = {"type": "listItem", "content": []}
        self.block_stack.append((tag, node))

    def _close_block(self, tag: str) -> None:
        for idx in range(len(self.block_stack) - 1, -1, -1):
            open_tag, node = self.block_stack[idx]
            if open_tag == tag:
                while len(self.block_stack) > idx:
                    _, closing_node = self.block_stack.pop()
                    self._append_block(closing_node)
                return

    def _append_block(self, node: dict) -> None:
        if not self.block_stack:
            self.doc_content.append(node)
            return

        parent = self.block_stack[-1][1]
        parent_type = parent.get("type")

        if parent_type in {"bulletList", "orderedList"} and node.get("type") == "listItem":
            parent["content"].append(node)
            return

        if parent_type == "listItem":
            parent["content"].append(node)
            return

        self.doc_content.append(node)

    def _append_inline(self, inline_node: dict) -> None:
        for _, node in reversed(self.block_stack):
            node_type = node.get("type")
            if node_type in {"paragraph", "heading"}:
                node["content"].append(inline_node)
                return
            if node_type == "listItem":
                if not node["content"] or node["content"][-1].get("type") != "paragraph":
                    node["content"].append({"type": "paragraph", "content": []})
                node["content"][-1]["content"].append(inline_node)
                return

        self.doc_content.append({"type": "paragraph", "content": [inline_node]})


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Importa posts desde un archivo JSON o CSV. "
            "El campo contenido debe ser JSON de TipTap (doc serializado)."
        )
    )
    parser.add_argument("source", help="Ruta al archivo .json o .csv")
    parser.add_argument(
        "--mode",
        choices=["insert", "upsert"],
        default="upsert",
        help="insert crea siempre; upsert actualiza por slug si ya existe",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Procesa solo los primeros N registros",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Valida y muestra resultados sin confirmar en base de datos",
    )
    return parser.parse_args()


def load_rows(source: Path) -> list[dict]:
    if source.suffix.lower() == ".json":
        data = json.loads(source.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("El JSON debe ser una lista de objetos")
        return data

    if source.suffix.lower() == ".csv":
        with source.open("r", encoding="utf-8-sig", newline="") as handle:
            return list(csv.DictReader(handle))

    raise ValueError("Formato no soportado. Usa .json o .csv")


def parse_fecha(value: str | None) -> datetime | None:
    if not value:
        return None

    text = value.strip()
    for fmt in ("%Y-%m-%d", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue

    try:
        return datetime.fromisoformat(text)
    except ValueError as exc:
        raise ValueError(f"Fecha inválida: {value}") from exc


def split_values(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    return [item.strip() for item in str(value).split("|") if item.strip()]


def parse_tiptap_content(value: object) -> str:
    if value is None or value == "":
        raise ValueError("El campo contenido es obligatorio")

    if isinstance(value, dict):
        content_obj = value
    elif isinstance(value, str):
        text = value.strip()
        if not text:
            raise ValueError("El campo contenido es obligatorio")
        try:
            content_obj = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError("contenido debe ser JSON válido de TipTap") from exc
    else:
        raise ValueError("contenido debe ser objeto JSON o string JSON")

    if not isinstance(content_obj, dict):
        raise ValueError("contenido debe ser un objeto JSON")
    if content_obj.get("type") != "doc":
        raise ValueError("contenido debe tener type='doc' para TipTap")
    if not isinstance(content_obj.get("content"), list):
        raise ValueError("contenido debe incluir content como lista")

    return json.dumps(content_obj, ensure_ascii=False)


def parse_tiptap_from_html(value: object) -> str:
    if value is None:
        raise ValueError("contenido_html no puede ser nulo")

    html_text = str(value).strip()
    if not html_text:
        raise ValueError("contenido_html no puede estar vacío")

    parser = TipTapHTMLParser()
    parser.feed(html_text)
    tiptap_doc = parser.to_doc()
    return json.dumps(tiptap_doc, ensure_ascii=False)


def normalize_row(row: dict) -> dict:
    titulo = (row.get("titulo") or "").strip()
    if not titulo:
        raise ValueError("Cada registro debe incluir titulo")

    slug = (row.get("slug") or "").strip() or slugify(titulo)
    tema_ids = [int(item) for item in split_values(row.get("tema_ids"))]
    tema_slugs = split_values(row.get("tema_slugs"))

    contenido_raw = row.get("contenido")
    if contenido_raw in (None, "") and "contenido_json" in row:
        contenido_raw = row.get("contenido_json")

    if contenido_raw not in (None, ""):
        contenido = parse_tiptap_content(contenido_raw)
    else:
        contenido_html_raw = row.get("contenido_html")
        contenido = parse_tiptap_from_html(contenido_html_raw)

    return {
        "titulo": titulo,
        "resumen": (row.get("resumen") or "").strip(),
        "contenido": contenido,
        "autor": (row.get("autor") or "IIEG").strip() or "IIEG",
        "fecha": parse_fecha(row.get("fecha")),
        "claves": (row.get("claves") or "").strip() or None,
        "video": (row.get("video") or "").strip() or None,
        "slug": slug,
        "tema_ids": tema_ids,
        "tema_slugs": tema_slugs,
        "gallery_images": split_values(row.get("gallery_images")),
    }


def unique_slug(db, requested_slug: str, current_id: int | None = None) -> str:
    slug = requested_slug
    base_slug = requested_slug
    counter = 1

    while True:
        existing = db.execute(select(Posts).where(Posts.slug == slug)).scalars().first()
        if not existing or existing.id == current_id:
            return slug
        slug = f"{base_slug}-{counter}"
        counter += 1


def resolve_temas(db, tema_ids: list[int], tema_slugs: list[str]) -> list[Subject]:
    temas: list[Subject] = []

    if tema_ids:
        temas_by_id = db.execute(select(Subject).where(Subject.id.in_(tema_ids))).scalars().all()
        found_ids = {tema.id for tema in temas_by_id}
        missing_ids = [tema_id for tema_id in tema_ids if tema_id not in found_ids]
        if missing_ids:
            raise ValueError(f"No existen temas con id: {missing_ids}")
        temas.extend(temas_by_id)

    if tema_slugs:
        temas_by_slug = db.execute(select(Subject).where(Subject.slug.in_(tema_slugs))).scalars().all()
        found_slugs = {tema.slug for tema in temas_by_slug}
        missing_slugs = [tema_slug for tema_slug in tema_slugs if tema_slug not in found_slugs]
        if missing_slugs:
            raise ValueError(f"No existen temas con slug: {missing_slugs}")

        existing_ids = {tema.id for tema in temas}
        temas.extend([tema for tema in temas_by_slug if tema.id not in existing_ids])

    return temas


def apply_gallery_images(post: Posts, urls: list[str]) -> None:
    """Reemplaza las imágenes de galería del post con la lista de URLs dada.

    Si la lista está vacía, las imágenes existentes se eliminan (cascade).
    El orden de las URLs se conserva como atributo `order`.
    """
    post.gallery_images = [
        GalleryImage(url=url, order=idx)
        for idx, url in enumerate(urls)
    ]


def build_or_update_post(db, payload: dict, mode: str) -> tuple[Posts, str]:
    existing = db.execute(select(Posts).where(Posts.slug == payload["slug"])).scalars().first()
    temas = resolve_temas(db, payload["tema_ids"], payload["tema_slugs"])
    gallery_urls = payload.get("gallery_images", [])

    if existing and mode == "insert":
        payload["slug"] = unique_slug(db, payload["slug"])
        existing = None

    if existing:
        existing.titulo = payload["titulo"]
        existing.resumen = payload["resumen"]
        existing.contenido = payload["contenido"]
        existing.autor = payload["autor"]
        existing.fecha = payload["fecha"]
        existing.claves = payload["claves"]
        existing.video = payload["video"]
        existing.temas = temas
        apply_gallery_images(existing, gallery_urls)
        return existing, "updated"

    post = Posts(
        titulo=payload["titulo"],
        resumen=payload["resumen"],
        contenido=payload["contenido"],
        autor=payload["autor"],
        fecha=payload["fecha"],
        claves=payload["claves"],
        video=payload["video"],
        slug=unique_slug(db, payload["slug"]),
    )
    post.temas = temas
    apply_gallery_images(post, gallery_urls)
    db.add(post)
    return post, "created"


def main() -> None:
    args = parse_args()
    source = Path(args.source)
    if not source.exists():
        raise FileNotFoundError(f"No existe el archivo: {source}")

    rows = load_rows(source)
    if args.limit is not None:
        rows = rows[: args.limit]

    db = SessionLocal()
    created = 0
    updated = 0

    try:
        for index, row in enumerate(rows, start=1):
            payload = normalize_row(row)
            _, action = build_or_update_post(db, payload, args.mode)
            if action == "created":
                created += 1
            else:
                updated += 1

            print(f"[{index}] {action.upper()} slug={payload['slug']} titulo={payload['titulo']}")

        if args.dry_run:
            db.rollback()
            print(f"Dry run completado. Creados={created}, actualizados={updated}")
            return

        db.commit()
        print(f"Importación completada. Creados={created}, actualizados={updated}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()