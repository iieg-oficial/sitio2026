from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.snieg import SniegResponse
from app.models import Snieg
from app.api.deps import get_db

router = APIRouter(prefix="/snieg", tags=["snieg - public"])

@router.get("/", response_model=SniegResponse)
def read_snieg(
    db: Session = Depends(get_db),
    ):
    snieg = db.query(Snieg).all()
    return {
        "snieg": snieg,
        "total": len(snieg),
    }