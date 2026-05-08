import aiosmtplib
from email.message import EmailMessage
from app.schemas import ContactoCreate
from app.core.settings import get_settings

settings = get_settings()

async def send_contact_email(form: ContactoCreate):
    msg = EmailMessage()
    msg["Subject"] = f"Contacto de {form.name}"
    msg["From"] = settings.smtp_user
    msg["To"] = settings.contact_dest_email
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
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,
    )