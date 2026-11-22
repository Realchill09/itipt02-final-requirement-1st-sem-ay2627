import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..config import RECIPE_COLUMNS
from ..database import get_db
from ..dependencies import get_current_user, require_admin
from ..models import RecipePatchRequest, RecipeRequest, RecipeUpdateRequest
from ..utils import format_recipe

router = APIRouter()


@router.get("/api/recipes")
def get_recipes(
    recipe_id: int | None = Query(default=None, alias="id", gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)

    # one recipe
    if recipe_id is not None:
        cursor.execute(f"SELECT {RECIPE_COLUMNS} FROM recipes WHERE id = %s", (recipe_id,))
        recipe = cursor.fetchone()
        cursor.close()
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found.")
        return {"success": True, "message": "Recipe loaded.", "recipe": format_recipe(recipe)}

    # all recipes
    cursor.execute(f"SELECT {RECIPE_COLUMNS} FROM recipes ORDER BY id DESC")
    recipes = [format_recipe(row) for row in cursor.fetchall()]
    cursor.close()
    return {"success": True, "message": "Recipes loaded.", "recipes": recipes}


@router.post("/api/recipes")
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


@router.put("/api/recipes")
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


@router.patch("/api/recipes")
def patch_recipe(
    request: RecipePatchRequest,
    user: dict[str, Any] = Depends(require_admin),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    # only the fields the client really sent
    updates = request.model_dump(exclude_unset=True, exclude={"id"})
    if not updates:
        raise HTTPException(status_code=422, detail="Provide at least one recipe field to update.")

    # these fields cannot be set to null
    for field in ["name", "category", "description", "ingredients", "steps"]:
        if field in updates and updates[field] is None:
            raise HTTPException(status_code=422, detail="This recipe field cannot be null.")

    # lists are saved as JSON text
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


@router.delete("/api/recipes")
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
