from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.services.face_service import face_service
from app.utils.image import upload_to_cv2

router = APIRouter(prefix="/face", tags=["face"])


@router.post("/detect")
async def detect_face(file: UploadFile = File(...)):
    try:
        image = await upload_to_cv2(file)
        return face_service.detect(image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Face detection failed: {exc}") from exc


@router.post("/register")
async def register_face(file: UploadFile = File(...)):
    try:
        image = await upload_to_cv2(file)
        return face_service.register(image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Face registration failed: {exc}") from exc


@router.post("/recognize")
async def recognize_face(file: UploadFile = File(...), embeddings: str = Form(...)):
    try:
        image = await upload_to_cv2(file)
        return face_service.recognize(image, embeddings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Face recognition failed: {exc}") from exc


@router.post("/quality")
async def check_face_quality(file: UploadFile = File(...)):
    try:
        image = await upload_to_cv2(file)
        return face_service.quality(image)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Face quality check failed: {exc}") from exc
