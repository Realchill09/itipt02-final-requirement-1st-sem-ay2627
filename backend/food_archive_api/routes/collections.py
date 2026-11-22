from typing import Any

import mysql.connector
from fastapi import APIRouter, Depends, HTTPException

from ..config import RECIPES_IN_COLLECTION_SQL
from ..database import get_db
from ..dependencies import get_current_user
from ..models import CollectionRequest, IdRequest
from ..utils import check_collection_owner, format_recipe, recipe_exists

router = APIRouter()


@router.get("/api/collections")
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

    # add the recipes of each collection
    for collection in collections:
        cursor.execute(RECIPES_IN_COLLECTION_SQL, (collection["id"],))
        collection["recipes"] = [format_recipe(row) for row in cursor.fetchall()]

    cursor.close()
    return {"success": True, "collections": collections}


@router.post("/api/collections")
def add_collection(
    request: CollectionRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Collection name cannot be blank.")

    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO collections (user_id, name) VALUES (%s, %s)",
            (user["id"], name),
        )
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=409, detail="A collection with this name already exists.")

    collection_id = cursor.lastrowid
    db.commit()
    cursor.close()
    return {"success": True, "message": "Collection created.", "collection": {"id": collection_id, "name": name}}


@router.patch("/api/collections/{collection_id}")
def rename_collection(
    collection_id: int,
    request: CollectionRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    name = request.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Collection name cannot be blank.")

    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    try:
        cursor.execute(
            "UPDATE collections SET name = %s WHERE id = %s AND user_id = %s",
            (name, collection_id, user["id"]),
        )
    except mysql.connector.IntegrityError:
        raise HTTPException(status_code=409, detail="A collection with this name already exists.")

    db.commit()
    cursor.close()
    return {"success": True, "message": "Collection renamed."}


@router.delete("/api/collections/{collection_id}")
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


@router.get("/api/collections/{collection_id}/recipes")
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


@router.post("/api/collections/{collection_id}/recipes")
def add_recipe_to_collection(
    collection_id: int,
    request: IdRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    check_collection_owner(cursor, collection_id, user["id"])
    recipe_exists(cursor, request.recipe_id)

    # skip if the recipe is already in the collection
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


@router.delete("/api/collections/{collection_id}/recipes/{recipe_id}")
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
