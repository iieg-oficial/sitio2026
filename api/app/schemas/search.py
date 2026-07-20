from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: str
    type: str
    title: str
    description: str = ""
    url: str
    external: bool = False
    archivo: str = ""
    link: str = ""
    enlace: str = ""
    tipo_curso: str = ""

class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResultItem]
