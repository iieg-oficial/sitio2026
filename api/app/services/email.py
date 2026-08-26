import aiosmtplib
from email.message import EmailMessage
from app.schemas import ContactoCreate
from app.core.settings import get_settings

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
    contact_dest = _sanitize_env_value(settings.contact_dest_email)

    # Validate SMTP settings early to provide a clear error message
    if not smtp_user or not smtp_password or not contact_dest:
        raise RuntimeError(
            "SMTP no configurado: establezca SMTP_USER, SMTP_PASSWORD y CONTACT_DEST_EMAIL en las variables de entorno"
        )

    msg["From"] = smtp_user
    msg["To"] = contact_dest
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