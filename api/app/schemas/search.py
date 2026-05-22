from pydantic import BaseModel


class SearchResultItem(BaseModel):
    id: str
    type: str
    title: str
    description: str = ""
    url: str
    external: bool = False


class SearchResponse(BaseModel):
    query: str
    total: int
    results: list[SearchResultItem]
