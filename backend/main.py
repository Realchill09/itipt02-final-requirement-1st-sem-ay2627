"""Compatibility entry point for running ``uvicorn main:app`` from backend/."""

from food_archive_api.main import app

__all__ = ["app"]
