from email.message import EmailMessage

import aiosmtplib

from app.core.settings import get_settings
from app.schemas import ContactoCreate

settings = get_settings()


def _sanitize_env_value(value: str | None) -> str | None:
    if value is None:
        return None
    # Remove inline comments after a '#' and trim whitespace
    return value.split("#", 1)[0].strip()


async def send_contact_email(form: ContactoCreate):
    msg = EmailMessage()
    msg["Subject"] = f"Contacto de {form.name}"

    smtp_user = _sanitize_env_value(settings.smtp_user)
    smtp_password = _sanitize_env_value(settings.smtp_password)
    raw_contact_dest = _sanitize_env_value(settings.contact_dest_email)

    # Validate SMTP settings early to provide a clear error message
    if not smtp_user or not smtp_password or not raw_contact_dest:
        raise RuntimeError(
            "SMTP no configurado: establezca SMTP_USER, SMTP_PASSWORD y CONTACT_DEST_EMAIL en las variables de entorno"
        )
    # Convertir la cadena separada por comas en una lista limpia
    recipients = [email.strip() for email in raw_contact_dest.split(",") if email.strip()]

    msg["From"] = smtp_user
    msg["To"] = ", ".join(recipients)
    msg["Reply-To"] = form.email
    msg.set_content(f"""
Nombre: {form.name}
Email: {form.email}

Mensaje:
{form.message}
    """)

    await aiosmtplib.send(
        msg,
        hostname="smtp.gmail.com",
        port=587,
        username=smtp_user,
        password=smtp_password,
        start_tls=True,
    )
