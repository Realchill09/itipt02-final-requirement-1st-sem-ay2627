from typing import Any

from fastapi import APIRouter, Depends

from ..database import get_db

router = APIRouter()


@router.get("/api/health")
def health(db: Any = Depends(get_db)) -> dict[str, str]:
    cursor = db.cursor()
    cursor.execute("SELECT 1")
    cursor.fetchone()
    cursor.close()
    return {"status": "ok", "database": "connected"}
