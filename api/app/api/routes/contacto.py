import logging
import os
import httpx
from fastapi import APIRouter, HTTPException, Request

from app.core.limiter import limiter
from app.schemas.contacto import ContactoCreate
from app.services.email import send_contact_email

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contacto", tags=["contacto"])


@router.post("/")
@limiter.limit("2/minute")
async def create_contacto(request: Request, form: ContactoCreate):
    # 1. Obtener la variable en tiempo de ejecución (evita problemas de cache al importar)
    recaptcha_secret = os.getenv("RECAPTCHA_SECRET_KEY")

    if not recaptcha_secret:
        logger.error("[reCAPTCHA] Falta RECAPTCHA_SECRET_KEY en las variables de entorno.")
        raise HTTPException(
            status_code=500, 
            detail="Error interno de configuración del servidor."
        )

    # 2. Verificación de reCAPTCHA con Google
    try:
        async with httpx.AsyncClient() as client:
            google_response = await client.post(
                "https://www.google.com/recaptcha/api/siteverify",
                data={
                    "secret": recaptcha_secret,
                    "response": form.recaptcha_token,
                },
                timeout=5.0
            )
            google_response.raise_for_status()
            result = google_response.json()
    except httpx.HTTPError as err:
        logger.error(f"[reCAPTCHA HTTP Error] Fallo al conectar con Google: {str(err)}")
        raise HTTPException(
            status_code=502, 
            detail="Error de comunicación con el servicio de verificación."
        )

    # 3. Validación de respuesta reCAPTCHA
    if not result.get("success"):
        error_codes = result.get("error-codes", [])
        logger.warning(f"[reCAPTCHA Rejected] Códigos devueltos por Google: {error_codes}")

        raise HTTPException(
            status_code=400, 
            detail="Error de validación de Captcha. Por favor reintente."
        )
    
    # 4. Procesar el envío del correo
    try:
        await send_contact_email(form)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"[SMTP Error] Fallo al enviar correo de contacto: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=500, 
            detail="Ocurrió un error al procesar el envío del mensaje. Intente más tarde."
        )