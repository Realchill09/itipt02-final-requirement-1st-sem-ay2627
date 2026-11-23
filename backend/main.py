import json
import uuid
from pathlib import Path
from typing import Any, Generator

import mysql.connector
from fastapi import Depends, FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

DB_HOST = "127.0.0.1"
DB_PORT = 3306
DB_USER = "root"
DB_PASSWORD = ""
DB_NAME = "food_archive"

ADMIN_EMAIL = "renz@gmail.com".strip().lower()
COOKIE_SECURE = False
SESSION_SECONDS = 12 * 60 * 60

UPLOAD_FOLDER = Path(__file__).resolve().parent / "uploads"
UPLOAD_FOLDER.mkdir(exist_ok=True)
MAX_IMAGE_SIZE = 5 * 1024 * 1024
IMAGE_TYPES: dict[str, str] = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
}

RECIPE_COLUMNS = "id, name, category, description, ingredients, steps, image, cooking_time, created_by"

RECIPES_IN_COLLECTION_SQL = """
    SELECT r.id, r.name, r.category, r.description, r.ingredients, r.steps,
           r.image, r.cooking_time, r.created_by
    FROM collection_recipes cr
    JOIN recipes r ON r.id = cr.recipe_id
    WHERE cr.collection_id = %s
    ORDER BY r.name
"""

app = FastAPI(title="Food Archive API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:4200",
        "http://localhost:4200",
        "http://127.0.0.1:8100",
        "http://localhost:8100",
        "capacitor://localhost",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: str = Field(min_length=3, max_length=150)
    password: str = Field(min_length=8, max_length=72)

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileRequest(BaseModel):
    username: str = Field(min_length=3, max_length=100)
    email: str = Field(min_length=3, max_length=150)

class RecipeRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str = Field(min_length=1, max_length=100)
    description: str = ""
    ingredients: list[str] = []
    steps: list[str] = []
    image: str | None = None
    cooking_time: int | None = Field(default=None, ge=0)

class RecipeUpdateRequest(RecipeRequest):
    id: int = Field(gt=0)

class RecipePatchRequest(BaseModel):
    id: int = Field(gt=0)
    name: str | None = None
    category: str | None = None
    description: str | None = None
    ingredients: list[str] | None = None
    steps: list[str] | None = None
    image: str | None = None
    cooking_time: int | None = Field(default=None, ge=0)

class CommentRequest(BaseModel):
    recipe_id: int = Field(gt=0)
    message: str = Field(min_length=1, max_length=5000)

class CommentUpdateRequest(BaseModel):
    id: int = Field(gt=0)
    message: str = Field(min_length=1, max_length=5000)

class CommentPatchRequest(BaseModel):
    id: int = Field(gt=0)
    message: str | None = None

class IdRequest(BaseModel):
    recipe_id: int = Field(gt=0)

class RatingRequest(BaseModel):
    recipe_id: int = Field(gt=0)
    rating: int = Field(ge=1, le=5)

class CollectionRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)

def get_db() -> Generator[Any, Any, None]:
    try:
        db = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connection_timeout=5,
        )
    except mysql.connector.Error as exc:
        raise HTTPException(
            status_code=400,
            detail="Could not connect to MySQL. Check the hardcoded DB settings at the top of main.py.",
        ) from exc

    try:
        yield db
    finally:
        db.close()

def is_admin(user: dict[str, Any]) -> bool:
    return user["role"] == "admin" and user["email"].strip().lower() == ADMIN_EMAIL

def get_current_user(
    request: Request,
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    session_id = request.cookies.get("foodarchive_session")
    if not session_id:
        raise HTTPException(status_code=400, detail="Login required.")

    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT u.id, u.username, u.email, u.role
        FROM user_sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.session_id = %s AND s.expires_at > UTC_TIMESTAMP()
        """,
        (session_id,),
    )
    user = cursor.fetchone()
    cursor.close()

    if not user:
        raise HTTPException(status_code=400, detail="Login session expired.")

    user["role"] = "admin" if is_admin(user) else "user"
    return user

def require_admin(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if not is_admin(user):
        raise HTTPException(status_code=400, detail="Administrator access is required.")
    return user

def to_list(value: str | bytes | bytearray | None) -> list[str]:
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

def get_rating_summary(db: Any, recipe_id: int, user_id: int) -> dict[str, Any]:
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

def update_comment_message(db: Any, user_id: int, comment_id: int, message: str) -> None:
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
    if extension in [".jpg", ".jpeg"]:
        return data.startswith(b"\xff\xd8\xff")
    if extension == ".png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if extension == ".webp":
        return data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    return False

@app.get("/api/health")
def health(db: Any = Depends(get_db)) -> dict[str, str]:
    cursor = db.cursor()
    cursor.execute("SELECT 1")
    cursor.fetchone()
    cursor.close()
    return {"status": "ok", "database": "connected"}

@app.post("/api/auth/register")
def register(request: RegisterRequest, db: Any = Depends(get_db)) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM users WHERE username = %s OR email = %s LIMIT 1",
        (request.username, request.email),
    )
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Username or email is already registered.")

    cursor.execute(
        "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, 'user')",
        (request.username, request.email, request.password),
    )
    db.commit()
    cursor.close()
    return {"success": True, "message": "Registration successful."}

@app.post("/api/auth/login")
def login(
    request: LoginRequest,
    response: Response,
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, username, email, role, password FROM users WHERE email = %s LIMIT 1",
        (request.email,),
    )
    user = cursor.fetchone()

    if not user or user["password"] != request.password:
        raise HTTPException(status_code=400, detail="Invalid email or password.")

    session_id = uuid.uuid4().hex
    cursor.execute("DELETE FROM user_sessions WHERE expires_at <= UTC_TIMESTAMP()")
    cursor.execute(
        """
        INSERT INTO user_sessions (session_id, user_id, expires_at)
        VALUES (%s, %s, UTC_TIMESTAMP() + INTERVAL 12 HOUR)
        """,
        (session_id, user["id"]),
    )
    db.commit()
    cursor.close()

    response.set_cookie(
        key="foodarchive_session",
        value=session_id,
        max_age=SESSION_SECONDS,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        path="/",
    )

    public_user = {
        "id": user["id"],
        "username": user["username"],
        "email": user["email"],
        "role": "admin" if is_admin(user) else "user",
    }
    return {"success": True, "message": "Login successful.", "user": public_user}

@app.post("/api/auth/logout")
def logout(request: Request, response: Response, db: Any = Depends(get_db)) -> dict[str, Any]:
    session_id = request.cookies.get("foodarchive_session")
    if session_id:
        cursor = db.cursor()
        cursor.execute("DELETE FROM user_sessions WHERE session_id = %s", (session_id,))
        db.commit()
        cursor.close()

    response.delete_cookie(key="foodarchive_session", path="/")
    return {"success": True, "message": "Logged out."}

@app.get("/api/auth/me")
def current_user(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {"success": True, "message": "Current user loaded.", "user": user}

@app.put("/api/auth/profile")
def update_profile(
    request: ProfileRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM users WHERE (username = %s OR email = %s) AND id <> %s LIMIT 1",
        (request.username, request.email, user["id"]),
    )
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Username or email is already registered.")

    cursor.execute(
        "UPDATE users SET username = %s, email = %s WHERE id = %s",
        (request.username, request.email, user["id"]),
    )
    db.commit()

    cursor.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user["id"],))
    updated = cursor.fetchone()
    cursor.close()

    updated["role"] = "admin" if is_admin(updated) else "user"
    return {"success": True, "message": "Profile updated successfully.", "user": updated}

@app.get("/api/recipes")
def get_recipes(
    recipe_id: int | None = Query(default=None, alias="id", gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)

    if recipe_id is not None:
        cursor.execute(f"SELECT {RECIPE_COLUMNS} FROM recipes WHERE id = %s", (recipe_id,))
        recipe = cursor.fetchone()
        cursor.close()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found.")
        return {"success": True, "message": "Recipe loaded.", "recipe": format_recipe(recipe)}

    cursor.execute(f"SELECT {RECIPE_COLUMNS} FROM recipes ORDER BY id DESC")
    recipes = [format_recipe(row) for row in cursor.fetchall()]
    cursor.close()
    return {"success": True, "message": "Recipes loaded.", "recipes": recipes}

@app.post("/api/recipes")
def add_recipe(
    request: RecipeRequest,
    user: dict[str, Any] = Depends(require_admin),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    cursor.execute(
        """
        INSERT INTO recipes
        (name, category, description, ingredients, steps, image, cooking_time, created_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """,
        (
            request.name,
            request.category,
            request.description,
            json.dumps(request.ingredients),
            json.dumps(request.steps),
            request.image,
            request.cooking_time,
            user["id"],
        ),
    )
    new_id = cursor.lastrowid
    db.commit()
    cursor.close()

    recipe = request.model_dump()
    recipe["id"] = new_id
    recipe["created_by"] = user["id"]
    return {"success": True, "message": "Recipe added.", "recipe": recipe}

@app.put("/api/recipes")
def update_recipe(
    request: RecipeUpdateRequest,
    user: dict[str, Any] = Depends(require_admin),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    cursor.execute(
        """
        UPDATE recipes SET name = %s, category = %s, description = %s,
        ingredients = %s, steps = %s, image = %s, cooking_time = %s
        WHERE id = %s
        """,
        (
            request.name,
            request.category,
            request.description,
            json.dumps(request.ingredients),
            json.dumps(request.steps),
            request.image,
            request.cooking_time,
            request.id,
        ),
    )
    db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe updated.", "recipe": request.model_dump()}

@app.patch("/api/recipes")
def patch_recipe(
    request: RecipePatchRequest,
    user: dict[str, Any] = Depends(require_admin),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    updates = request.model_dump(exclude_unset=True, exclude={"id"})
    if not updates:
        raise HTTPException(status_code=400, detail="Provide at least one recipe field to update.")

    for field in ["name", "category", "description", "ingredients", "steps"]:
        if field in updates and updates[field] is None:
            raise HTTPException(status_code=400, detail="This recipe field cannot be null.")

    if "ingredients" in updates:
        updates["ingredients"] = json.dumps(updates["ingredients"])
    if "steps" in updates:
        updates["steps"] = json.dumps(updates["steps"])

    set_part = ", ".join(f"{field} = %s" for field in updates)
    values = list(updates.values()) + [request.id]

    cursor = db.cursor()
    cursor.execute(f"UPDATE recipes SET {set_part} WHERE id = %s", values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe updated.", "recipe": {"id": request.id, **updates}}

@app.delete("/api/recipes")
def delete_recipe(
    recipe_id: int = Query(alias="id", gt=0),
    user: dict[str, Any] = Depends(require_admin),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    cursor.execute("DELETE FROM recipes WHERE id = %s", (recipe_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Recipe not found.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe deleted."}

@app.get("/api/comments")
def get_comments(
    recipe_id: int = Query(gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT c.id, c.recipe_id, c.user_id, u.username, c.message, c.created_at
        FROM comments c JOIN users u ON u.id = c.user_id
        WHERE c.recipe_id = %s
        ORDER BY c.created_at ASC, c.id ASC
        """,
        (recipe_id,),
    )
    comments = cursor.fetchall()
    cursor.close()
    return {"success": True, "message": "Comments loaded.", "comments": comments}

@app.post("/api/comments")
def add_comment(
    request: CommentRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, request.recipe_id)
    cursor.execute(
        "INSERT INTO comments (recipe_id, user_id, message) VALUES (%s, %s, %s)",
        (request.recipe_id, user["id"], request.message),
    )
    comment_id = cursor.lastrowid
    db.commit()
    cursor.close()
    return {"success": True, "message": "Comment added.", "comment": {"id": comment_id}}

@app.put("/api/comments")
def update_comment(
    request: CommentUpdateRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    update_comment_message(db, user["id"], request.id, request.message)
    return {"success": True, "message": "Comment updated."}

@app.patch("/api/comments")
def patch_comment(
    request: CommentPatchRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    if request.message is None:
        raise HTTPException(status_code=400, detail="Provide a comment message to update.")
    update_comment_message(db, user["id"], request.id, request.message)
    return {"success": True, "message": "Comment updated."}

@app.delete("/api/comments")
def delete_comment(
    comment_id: int = Query(alias="id", gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    if is_admin(user):
        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
    else:
        cursor.execute(
            "DELETE FROM comments WHERE id = %s AND user_id = %s",
            (comment_id, user["id"]),
        )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Comment not found.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Comment deleted."}

@app.get("/api/favorites")
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

@app.post("/api/favorites")
def add_favorite(
    request: IdRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, request.recipe_id)

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

@app.delete("/api/favorites")
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

@app.get("/api/ratings")
def get_rating(
    recipe_id: int = Query(gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    recipe_exists(cursor, recipe_id)
    cursor.close()
    return {"success": True, "rating": get_rating_summary(db, recipe_id, user["id"])}

@app.put("/api/ratings")
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

@app.get("/api/collections")
def get_collections(
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name FROM collections WHERE user_id = %s ORDER BY name",
        (user["id"],),
    )
    collections = cursor.fetchall()

    for collection in collections:
        cursor.execute(RECIPES_IN_COLLECTION_SQL, (collection["id"],))
        collection["recipes"] = [format_recipe(row) for row in cursor.fetchall()]

    cursor.close()
    return {"success": True, "collections": collections}

@app.post("/api/collections")
def add_collection(
    request: CollectionRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Collection name cannot be blank.")

    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO collections (user_id, name) VALUES (%s, %s)",
            (user["id"], name),
        )
    except mysql.connector.IntegrityError as exc:
        raise HTTPException(
            status_code=400,
            detail="A collection with this name already exists.",
        ) from exc

    collection_id = cursor.lastrowid
    db.commit()
    cursor.close()
    return {"success": True, "message": "Collection created.", "collection": {"id": collection_id, "name": name}}

@app.patch("/api/collections/{collection_id}")
def rename_collection(
    collection_id: int,
    request: CollectionRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Collection name cannot be blank.")

    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    try:
        cursor.execute(
            "UPDATE collections SET name = %s WHERE id = %s AND user_id = %s",
            (name, collection_id, user["id"]),
        )
    except mysql.connector.IntegrityError as exc:
        raise HTTPException(
            status_code=400,
            detail="A collection with this name already exists.",
        ) from exc

    db.commit()
    cursor.close()
    return {"success": True, "message": "Collection renamed."}

@app.delete("/api/collections/{collection_id}")
def delete_collection(
    collection_id: int,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    cursor.execute("DELETE FROM collection_recipes WHERE collection_id = %s", (collection_id,))
    cursor.execute("DELETE FROM collections WHERE id = %s", (collection_id,))
    db.commit()
    cursor.close()
    return {"success": True, "message": "Collection deleted."}

@app.get("/api/collections/{collection_id}/recipes")
def get_collection_recipes(
    collection_id: int,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    check_collection_owner(cursor, collection_id, user["id"])
    cursor.execute(RECIPES_IN_COLLECTION_SQL, (collection_id,))
    recipes = [format_recipe(row) for row in cursor.fetchall()]
    cursor.close()
    return {"success": True, "recipes": recipes}

@app.post("/api/collections/{collection_id}/recipes")
def add_recipe_to_collection(
    collection_id: int,
    request: IdRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    recipe_exists(cursor, request.recipe_id)

    cursor.execute(
        "SELECT collection_id FROM collection_recipes WHERE collection_id = %s AND recipe_id = %s",
        (collection_id, request.recipe_id),
    )
    if cursor.fetchone() is None:
        cursor.execute(
            "INSERT INTO collection_recipes (collection_id, recipe_id) VALUES (%s, %s)",
            (collection_id, request.recipe_id),
        )
        db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe added to collection."}

@app.delete("/api/collections/{collection_id}/recipes/{recipe_id}")
def remove_recipe_from_collection(
    collection_id: int,
    recipe_id: int,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    cursor.execute(
        "DELETE FROM collection_recipes WHERE collection_id = %s AND recipe_id = %s",
        (collection_id, recipe_id),
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Recipe is not in this collection.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Recipe removed from collection."}

@app.post("/api/uploads")
def upload_recipe_image(
    request: Request,
    image: UploadFile = File(...),
    user: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    extension = Path(image.filename or "").suffix.lower()

    if extension not in IMAGE_TYPES or image.content_type != IMAGE_TYPES[extension]:
        raise HTTPException(status_code=400, detail="Upload a JPEG, PNG, or WebP image.")

    content = image.file.read(MAX_IMAGE_SIZE + 1)
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller.")
    if not content or not image_bytes_are_valid(extension, content):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid image.")

    filename = uuid.uuid4().hex + extension
    (UPLOAD_FOLDER / filename).write_bytes(content)

    url = str(request.base_url).rstrip("/") + "/api/uploads/" + filename
    return {"success": True, "url": url}

app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_FOLDER)), name="uploads")
