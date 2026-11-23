from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import UPLOAD_FOLDER
from .routes import auth, collections, comments, favorites, health, ratings, recipes, uploads

app: FastAPI = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:4200",
        "http://localhost:4200",
        "http://127.0.0.1:8100",
        "http://localhost:8100",
        "capacitor://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(recipes.router)
app.include_router(comments.router)
app.include_router(favorites.router)
app.include_router(ratings.router)
app.include_router(collections.router)
app.include_router(uploads.router)

app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_FOLDER)), name="uploads")
