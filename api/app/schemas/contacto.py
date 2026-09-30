from typing import List

from pydantic import BaseModel, EmailStr


class ContactoCreate(BaseModel):
    name: str
    email: EmailStr
    message: str
    recaptcha_token: str


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
