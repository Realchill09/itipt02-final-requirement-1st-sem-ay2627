from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..database import get_db
from ..dependencies import get_current_user
from ..models import IdRequest
from ..utils import recipe_exists

router = APIRouter()


@router.get("/api/favorites")
def get_favorites(
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    cursor.execute(
        "SELECT recipe_id FROM favorites WHERE user_id = %s ORDER BY recipe_id",
        (user["id"],),
    )
    favorite_ids = [row[0] for row in cursor.fetchall()]
    cursor.close()
    return {"success": True, "favorites": favorite_ids}


@router.post("/api/favorites")
def add_favorite(
    request: IdRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, request.recipe_id)

    # skip if it is already a favorite
    cursor.execute(
        "SELECT user_id FROM favorites WHERE user_id = %s AND recipe_id = %s",
        (user["id"], request.recipe_id),
    )
    if cursor.fetchone() is None:
        cursor.execute(
            "INSERT INTO favorites (user_id, recipe_id) VALUES (%s, %s)",
            (user["id"], request.recipe_id),
        )
        db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe added to favorites."}


@router.delete("/api/favorites")
def remove_favorite(
    recipe_id: int = Query(gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    cursor.execute(
        "DELETE FROM favorites WHERE user_id = %s AND recipe_id = %s",
        (user["id"], recipe_id),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Favorite not found.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe removed from favorites."}
