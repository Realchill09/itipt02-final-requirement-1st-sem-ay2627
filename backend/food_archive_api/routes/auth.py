from typing import Any
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response

from ..config import COOKIE_SECURE, SESSION_SECONDS
from ..database import get_db
from ..dependencies import get_current_user, is_admin
from ..models import LoginRequest, ProfileRequest, RegisterRequest

router = APIRouter()


@router.post("/api/auth/register")
def register(request: RegisterRequest, db: Any = Depends(get_db)) -> dict[str, Any]:
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT id FROM users WHERE username = %s OR email = %s LIMIT 1",
        (request.username, request.email),
    )
    if cursor.fetchone():
        raise HTTPException(status_code=409, detail="Username or email is already registered.")

    cursor.execute(
        "INSERT INTO users (username, email, password, role) VALUES (%s, %s, %s, 'user')",
        (request.username, request.email, request.password),
    )
    db.commit()
    cursor.close()
    return {"success": True, "message": "Registration successful."}


@router.post("/api/auth/login")
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
        raise HTTPException(status_code=401, detail="Invalid email or password.")

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


@router.post("/api/auth/logout")
def logout(request: Request, response: Response, db: Any = Depends(get_db)) -> dict[str, Any]:
    session_id = request.cookies.get("foodarchive_session")
    if session_id:
        cursor = db.cursor()
        cursor.execute("DELETE FROM user_sessions WHERE session_id = %s", (session_id,))
        db.commit()
        cursor.close()

    response.delete_cookie(key="foodarchive_session", path="/")
    return {"success": True, "message": "Logged out."}


@router.get("/api/auth/me")
def current_user(user: dict[str, Any] = Depends(get_current_user)) -> dict[str, Any]:
    return {"success": True, "message": "Current user loaded.", "user": user}


@router.put("/api/auth/profile")
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
        raise HTTPException(status_code=409, detail="Username or email is already registered.")

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
