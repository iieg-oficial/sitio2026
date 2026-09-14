from app.api.deps import SessionLocal
from app.models.page import Page

db = SessionLocal()
for page in db.query(Page).all():
    print(page.slug)
