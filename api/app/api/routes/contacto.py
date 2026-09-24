from fastapi import APIRouter, HTTPException
import httpx
import os

from app.schemas.contacto import ContactoCreate
from app.services.email import send_contact_email

router = APIRouter(prefix="/contacto", tags=["contacto"])

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

@router.post("/")
async def create_contacto(form: ContactoCreate):
    # Validar que la variable de entorno exista en el servidor
    if not RECAPTCHA_SECRET_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Error de configuración del servidor: Falta RECAPTCHA_SECRET_KEY"
        )

    try:
        async with httpx.AsyncClient() as client:
            google_response = await client.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": RECAPTCHA_SECRET_KEY,
                    "response": form.recaptcha_token,
                },
                timeout=5.0 # Previene bloqueos si Google tarda en responder
            )
            google_response.raise_for_status()
            result = google_response.json()
    except httpx.HTTPError as err:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al conectar con la verificación de Google: {str(err)}"
        )

    # 2. Si Google rechaza el token (success = False)
    if not result.get("success"):
        # Opcional: imprimir los códigos de error de Google en la consola del servidor
        error_codes = result.get("error-codes", [])
        print(f"[reCAPTCHA Error] Códigos devueltos por Google: {error_codes}")

        raise HTTPException(
            status_code=400, 
            detail="Error de validación de Captcha. Por favor reintente."
        )
    
    # 3. Procesar el envío de correo si el captcha fue válido
    try:
        await send_contact_email(form)
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))