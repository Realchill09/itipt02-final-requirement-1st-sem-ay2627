from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query

from ..database import get_db
from ..dependencies import get_current_user, is_admin
from ..models import CommentPatchRequest, CommentRequest, CommentUpdateRequest
from ..utils import recipe_exists, update_comment_message

router = APIRouter()


@router.get("/api/comments")
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


@router.post("/api/comments")
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


@router.put("/api/comments")
def update_comment(
    request: CommentUpdateRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    update_comment_message(db, user["id"], request.id, request.message)
    return {"success": True, "message": "Comment updated."}


@router.patch("/api/comments")
def patch_comment(
    request: CommentPatchRequest,
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    if request.message is None:
        raise HTTPException(status_code=422, detail="Provide a comment message to update.")
    update_comment_message(db, user["id"], request.id, request.message)
    return {"success": True, "message": "Comment updated."}


@router.delete("/api/comments")
def delete_comment(
    comment_id: int = Query(alias="id", gt=0),
    user: dict[str, Any] = Depends(get_current_user),
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    cursor = db.cursor()
    if is_admin(user):
        # admin can delete any comment
        cursor.execute("DELETE FROM comments WHERE id = %s", (comment_id,))
    else:
        # normal user can delete only their own comment
        cursor.execute(
            "DELETE FROM comments WHERE id = %s AND user_id = %s",
            (comment_id, user["id"]),
        )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Comment not found.")
    db.commit()
    cursor.close()
    return {"success": True, "message": "Comment deleted."}
