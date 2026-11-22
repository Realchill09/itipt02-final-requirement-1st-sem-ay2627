from pathlib import Path
from typing import Any
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from ..config import IMAGE_TYPES, MAX_IMAGE_SIZE, UPLOAD_FOLDER
from ..dependencies import require_admin
from ..utils import image_bytes_are_valid

router = APIRouter()


@router.post("/api/uploads")
def upload_recipe_image(
    request: Request,
    image: UploadFile = File(...),
    user: dict[str, Any] = Depends(require_admin),
) -> dict[str, Any]:
    extension = Path(image.filename or "").suffix.lower()

    # check file type
    if extension not in IMAGE_TYPES or image.content_type != IMAGE_TYPES[extension]:
        raise HTTPException(status_code=415, detail="Upload a JPEG, PNG, or WebP image.")

    # read one extra byte so we can tell if the file is too big
    content = image.file.read(MAX_IMAGE_SIZE + 1)
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image must be 5 MB or smaller.")
    if not content or not image_bytes_are_valid(extension, content):
        raise HTTPException(status_code=415, detail="The uploaded file is not a valid image.")

    # save with a random name so files never overwrite each other
    filename = uuid.uuid4().hex + extension
    (UPLOAD_FOLDER / filename).write_bytes(content)

    url = str(request.base_url).rstrip("/") + "/api/uploads/" + filename
    return {"success": True, "url": url}
