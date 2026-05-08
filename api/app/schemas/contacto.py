from pydantic import BaseModel, EmailStr
from typing import List

class ContactoCreate(BaseModel):
    name: str
    email: EmailStr
    message: str


class ContactoOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    message: str

    class Config:
        from_attributes = True

class ContactoResponse(BaseModel):
    contactos: List[ContactoOut]
    total: int