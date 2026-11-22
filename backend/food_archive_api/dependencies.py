from typing import Any

from fastapi import Depends, HTTPException, Request

from .config import ADMIN_EMAIL
from .database import get_db


def is_admin(user: dict[str, Any]) -> bool:
    # admin only if the role is admin AND the email matches the one in .env
    return user["role"] == "admin" and user["email"].strip().lower() == ADMIN_EMAIL


def get_current_user(
    request: Request,
    db: Any = Depends(get_db),
) -> dict[str, Any]:
    session_id = request.cookies.get("foodarchive_session")
    if not session_id:
        raise HTTPException(status_code=401, detail="Login required.")

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
        raise HTTPException(status_code=401, detail="Login session expired.")

    user["role"] = "admin" if is_admin(user) else "user"
    return user


def require_admin(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    if not is_admin(user):
        raise HTTPException(status_code=403, detail="Administrator access is required.")
    return user
