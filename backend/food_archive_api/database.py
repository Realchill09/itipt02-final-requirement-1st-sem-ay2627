import os
from typing import Any, Generator

import mysql.connector
from fastapi import HTTPException


def get_db() -> Generator[Any, Any, None]:
    try:
        db = mysql.connector.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            port=int(os.getenv("DB_PORT", "3306")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "food_archive"),
            connection_timeout=5,
        )
    except mysql.connector.Error:
        raise HTTPException(status_code=503, detail="Could not connect to MySQL.")

    try:
        yield db
    finally:
        db.close()
