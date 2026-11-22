import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "renz@gmail.com").strip().lower()
COOKIE_SECURE: bool = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"
SESSION_SECONDS: int = 12 * 60 * 60
UPLOAD_FOLDER: Path = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_IMAGE_SIZE: int = 5 * 1024 * 1024

IMAGE_TYPES: dict[str, str] = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

RECIPE_COLUMNS: str = "id, name, category, description, ingredients, steps, image, cooking_time, created_by"

RECIPES_IN_COLLECTION_SQL: str = """
    SELECT r.id, r.name, r.category, r.description, r.ingredients, r.steps,
           r.image, r.cooking_time, r.created_by
    FROM collection_recipes cr
    JOIN recipes r ON r.id = cr.recipe_id
    WHERE cr.collection_id = %s
    ORDER BY r.name
"""
