from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..database import get_db
from ..dependencies import get_current_user
from ..models import RatingRequest
from ..utils import get_rating_summary, recipe_exists

router = APIRouter()


@router.get("/api/ratings")
def get_rating(
    recipe_id: int = Query(gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, recipe_id)
    cursor.close()
    return {"success": True, "rating": get_rating_summary(db, recipe_id, user["id"])}


@router.put("/api/ratings")
def save_rating(
    request: RatingRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, request.recipe_id)
    cursor.execute(
        """
        INSERT INTO ratings (user_id, recipe_id, rating) VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE rating = VALUES(rating)
        """,
        (user["id"], request.recipe_id, request.rating),
    )
    db.commit()
    cursor.close()
    return {
        "success": True,
        "message": "Rating saved.",
        "rating": get_rating_summary(db, request.recipe_id, user["id"]),
    }
