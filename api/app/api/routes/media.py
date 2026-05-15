import mimetypes
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, verify_csrf
from app.core.settings import get_settings
from app.models.media import Media, MediaFolder
from app.models.user import Usuario
from app.schemas.media import FolderCreate, FolderResponse
from app.services.acervo import IIEG_BUCKET, PORTAL_BUCKET, get_acervo_service

router = APIRouter(prefix="/multimedia", tags=["media"])

settings = get_settings()

ALLOWED_BUCKETS = {PORTAL_BUCKET, IIEG_BUCKET}


def _validate_bucket(bucket: str) -> str:
    if bucket not in ALLOWED_BUCKETS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bucket no permitido. Valores válidos: {sorted(ALLOWED_BUCKETS)}",
        )
    return bucket


def _serialize_media(item: Media) -> dict:
    return {
        "id": str(item.id),
        "name": item.name,
        "originalName": item.original_name,
        "type": item.type,
        "size": item.size,
        "url": item.url,
        "thumbnail": item.thumbnail,
        "folder": item.folder,
        "uploadedBy": str(item.uploaded_by),
        "uploadedByName": item.uploaded_by_user.name if item.uploaded_by_user else "Unknown",
        "uploadedAt": item.uploaded_at.isoformat(),
        "metadata": item.metadata_json or {},
        "bucket": PORTAL_BUCKET,
    }


def _serialize_s3_object(obj: dict, bucket: str) -> dict:
    name = obj["name"]
    content_type = obj.get("content_type") or mimetypes.guess_type(name)[0] or "application/octet-stream"
    is_image = content_type.startswith("image/")
    return {
        "id": f"{bucket}:{name}",
        "name": name,
        "originalName": name.rsplit("/", 1)[-1],
        "type": content_type,
        "size": obj["size"],
        "url": obj["url"],
        "thumbnail": obj["url"] if is_image else None,
        "folder": "/" + name.rsplit("/", 1)[0] if "/" in name else "/",
        "uploadedBy": "",
        "uploadedByName": "",
        "uploadedAt": obj["last_modified"].isoformat() if obj.get("last_modified") else "",
        "metadata": {},
        "bucket": bucket,
    }


@router.get("", response_model=list[dict])
async def listar_media(
    db: Session = Depends(get_db),
    folder: str | None = Query(None),
    type: str | None = Query(None),
    search: str | None = Query(None),
    bucket: str = Query(PORTAL_BUCKET),
):
    bucket = _validate_bucket(bucket)

    if bucket == PORTAL_BUCKET:
        query = db.query(Media)

        if folder:
            query = query.filter(Media.folder == folder)

        if type:
            query = query.filter(Media.type.startswith(type))

        if search:
            search_lower = f"%{search.lower()}%"
            query = query.filter(
                Media.name.ilike(search_lower) | Media.original_name.ilike(search_lower)
            )

        items = query.order_by(Media.uploaded_at.desc()).all()
        return [_serialize_media(item) for item in items]

    acervo_service = get_acervo_service()
    objects = acervo_service.list_objects(bucket=bucket)
    items = [_serialize_s3_object(obj, bucket) for obj in objects]

    if type:
        items = [i for i in items if i["type"].startswith(type)]
    if search:
        search_lower = search.lower()
        items = [
            i
            for i in items
            if search_lower in i["name"].lower() or search_lower in i["originalName"].lower()
        ]
    if folder:
        items = [i for i in items if i["folder"] == folder]

    items.sort(key=lambda i: i["uploadedAt"], reverse=True)
    return items


@router.get("/carpetas", response_model=list[dict])
async def listar_carpetas(db: Session = Depends(get_db)):
    folders = db.query(MediaFolder).all()
    return [
        {"id": str(folder.id), "name": folder.name, "path": folder.path, "parent": folder.parent}
        for folder in folders
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def subir_archivo(
    file: UploadFile = File(...),
    folder: str = Form("/"),
    alt: str = Form(""),
    bucket: str = Form(PORTAL_BUCKET),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    bucket = _validate_bucket(bucket)

    acervo_service = get_acervo_service()

    file_extension = file.filename.split(".")[-1] if "." in file.filename else ""
    unique_name = f"{uuid.uuid4()}.{file_extension}" if file_extension else str(uuid.uuid4())

    try:
        url = await acervo_service.upload_file(file, unique_name, bucket=bucket)

        if bucket == PORTAL_BUCKET:
            nuevo_media = Media(
                name=unique_name,
                original_name=file.filename,
                type=file.content_type or "application/octet-stream",
                size=file.size or 0,
                url=url,
                thumbnail=url if file.content_type and file.content_type.startswith("image/") else None,
                folder=folder,
                uploaded_by=current_user.id,
                metadata_json={"alt": alt} if alt else {},
            )

            db.add(nuevo_media)
            db.commit()
            db.refresh(nuevo_media)
            return _serialize_media(nuevo_media)

        return {
            "id": f"{bucket}:{unique_name}",
            "name": unique_name,
            "originalName": file.filename,
            "type": file.content_type or "application/octet-stream",
            "size": file.size or 0,
            "url": url,
            "thumbnail": url if file.content_type and file.content_type.startswith("image/") else None,
            "folder": folder,
            "uploadedBy": str(current_user.id),
            "uploadedByName": current_user.name,
            "uploadedAt": "",
            "metadata": {"alt": alt} if alt else {},
            "bucket": bucket,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir archivo: {str(e)}",
        )


@router.delete("/{media_id}")
async def eliminar_archivo(
    media_id: str,
    bucket: str = Query(PORTAL_BUCKET),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    bucket = _validate_bucket(bucket)
    acervo_service = get_acervo_service()

    if bucket == PORTAL_BUCKET:
        try:
            db_id = int(media_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ID inválido para bucket portal",
            )

        media_item = db.query(Media).filter(Media.id == db_id).first()
        if not media_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Archivo no encontrado"
            )

        acervo_service.delete_file(media_item.name, bucket=PORTAL_BUCKET)
        db.delete(media_item)
        db.commit()
        return {"message": "Archivo eliminado exitosamente"}

    if ":" in media_id:
        _, object_name = media_id.split(":", 1)
    else:
        object_name = media_id

    if not acervo_service.delete_file(object_name, bucket=bucket):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo eliminar el archivo en el acervo",
        )

    return {"message": "Archivo eliminado exitosamente"}


@router.post("/carpetas", status_code=status.HTTP_201_CREATED, response_model=FolderResponse)
async def crear_carpeta(
    folder_data: FolderCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(verify_csrf),
):
    if folder_data.parent:
        if folder_data.parent.endswith('/'):
            path = f"{folder_data.parent}{folder_data.name}"
        else:
            path = f"{folder_data.parent}/{folder_data.name}"
    else:
        path = f"/{folder_data.name}"

    nueva_carpeta = MediaFolder(name=folder_data.name, path=path, parent=folder_data.parent)
    db.add(nueva_carpeta)
    db.commit()
    db.refresh(nueva_carpeta)

    return FolderResponse(
        id=str(nueva_carpeta.id),
        name=nueva_carpeta.name,
        path=nueva_carpeta.path,
        parent=nueva_carpeta.parent,
    )
