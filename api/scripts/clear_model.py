#!/usr/bin/env python3

import argparse
import importlib

from sqlalchemy import delete, select

from app.core.database import Base, SessionLocal


def clear_model(model_name: str, dry_run: bool = False) -> int:
    module = importlib.import_module('app.models')
    model = getattr(module, model_name, None)
    if model is None:
        raise AttributeError(f"No existe el modelo {model_name!r} en app.models")

    db = SessionLocal()
    try:
        ids = db.scalars(select(model.id)).all()
        print(f"Cantidad a procesar de {model_name}: {len(ids)}")

        if dry_run:
            print('DRY_RUN: no se borraron registros')
            return 0

        for table in Base.metadata.tables.values():
            if table is model.__table__:
                continue
            for fk in table.foreign_keys:
                if fk.column.table is model.__table__:
                    db.execute(delete(table).where(fk.parent.in_(ids)))

        db.commit()
        count = db.query(model).delete(synchronize_session=False)
        db.commit()
        print(f"Registros eliminados de {model_name}: {count}")
        return count
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser(description='Borra los registros de un modelo de la base de datos.')
    parser.add_argument('--model', required=True, help='Nombre del modelo a limpiar')
    parser.add_argument('--dry-run', action='store_true', help='Muestra cuántos registros se borrarían sin eliminarlos')
    args = parser.parse_args()

    try:
        clear_model(args.model, dry_run=args.dry_run)
    except Exception as exc:
        raise SystemExit(str(exc)) from exc


if __name__ == '__main__':
    main()
