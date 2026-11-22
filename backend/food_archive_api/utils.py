import json
from typing import Any

from fastapi import HTTPException


def to_list(value: str | bytes | bytearray | None) -> list[str]:
    # ingredients and steps are saved as JSON text, so turn them back into a list
    if value is None:
        return []
    try:
        data = json.loads(value)
    except (TypeError, ValueError):
        return []
    if isinstance(data, list):
        return [str(item) for item in data]
    return []


def format_recipe(row: dict[str, Any]) -> dict[str, Any]:
    row["ingredients"] = to_list(row["ingredients"])
    row["steps"] = to_list(row["steps"])
    return row


def recipe_exists(cursor: Any, recipe_id: int) -> None:
    cursor.execute("SELECT id FROM recipes WHERE id = %s", (recipe_id,))
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="Recipe not found.")


def check_collection_owner(cursor: Any, collection_id: int, user_id: int) -> None:
    cursor.execute(
        "SELECT id FROM collections WHERE id = %s AND user_id = %s",
        (collection_id, user_id),
    )
    if cursor.fetchone() is None:
        raise HTTPException(status_code=404, detail="Collection not found.")


def get_rating_summary(
    db: Any,
    recipe_id: int,
    user_id: int,
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT ROUND(COALESCE(AVG(rating), 0), 1) AS average_rating,
               COUNT(*) AS rating_count,
               MAX(CASE WHEN user_id = %s THEN rating END) AS user_rating
        FROM ratings
        WHERE recipe_id = %s
        """,
        (user_id, recipe_id),
    )
    result = cursor.fetchone()
    cursor.close()
    return {
        "average_rating": float(result["average_rating"]),
        "rating_count": result["rating_count"],
        "user_rating": result["user_rating"],
    }


def update_comment_message(
    db: Any,
    user_id: int,
    comment_id: int,
    message: str,
) -> None:
    cursor = db.cursor()
    cursor.execute(
        "UPDATE comments SET message = %s WHERE id = %s AND user_id = %s",
        (message, comment_id, user_id),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Comment not found.")
    db.commit()
    cursor.close()


def image_bytes_are_valid(extension: str, data: bytes) -> bool:
    # check the first bytes of the file to make sure it is a real image
    if extension in [".jpg", ".jpeg"]:
        return data.startswith(b"\xff\xd8\xff")
    if extension == ".png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if extension == ".webp":
        return data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    return False
