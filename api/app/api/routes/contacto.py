from fastapi import APIRouter, HTTPException
import httpx
import os

from app.schemas.contacto import ContactoCreate
from app.services.email import send_contact_email

router = APIRouter(prefix="/contacto", tags=["contacto"])

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

@router.post("/")
async def create_contacto(form: ContactoCreate):

    async with httpx.AsyncClient() as client:
        google_response = await client.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={
                "secret": RECAPTCHA_SECRET_KEY,
                "response": form.recaptcha_token,
            }
        )
        result = google_response.json()

    # 2. Si la validación falla, rechazar la solicitud
    if not result.get("success"):
        raise HTTPException(
            status_code=400, 
            detail="Error de validación de Captcha"
        )
    
    try:
        await send_contact_email(form)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
