from app.models.documentacion import TipoEnum


def get_tipos() -> dict[str, list[str]]:
    return {"tipos": [tipo.value for tipo in TipoEnum]}
