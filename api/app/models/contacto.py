from pydantic import BaseModel, EmailStr

class Contacto(BaseModel):
    name: str
    email: EmailStr
    message: str