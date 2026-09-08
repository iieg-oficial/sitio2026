from fastapi import APIRouter, HTTPException

from app.schemas.contacto import ContactoCreate
from app.services.email import send_contact_email

router = APIRouter(prefix="/contacto", tags=["contacto"])

@router.post("/")
async def create_contacto(form: ContactoCreate):
    try:
        await send_contact_email(form)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
