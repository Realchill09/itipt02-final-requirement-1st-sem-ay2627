from pydantic import BaseModel, Field


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
