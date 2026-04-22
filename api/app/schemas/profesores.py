from pydantic import BaseModel

class ProfesoresCreate(BaseModel):
    nombre: str
    puesto: str
    descripcion: str
    foto: str

class ProfesoresOut(BaseModel):
    id: int
    nombre: str
    puesto: str
    descripcion: str
    foto: str

    class Config:
        from_attributes = True

class ProfesoresResponse(BaseModel):
    id: int
    nombre: str
    puesto: str
    descripcion: str
    foto: str

    class Config:
        from_attributes = True