from typing import Any, Dict, List

import cv2
import numpy as np
from fastapi import UploadFile


async def upload_to_cv2(file: UploadFile) -> np.ndarray:
    content = await file.read()
    image_buffer = np.frombuffer(content, np.uint8)
    image = cv2.imdecode(image_buffer, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Invalid image file")

    return image


def calculate_brightness(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(np.mean(gray))


def calculate_sharpness(image: np.ndarray) -> float:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return float(cv2.Laplacian(gray, cv2.CV_64F).var())


def classify_brightness(score: float) -> str:
    if score < 70:
        return "low"
    if score > 210:
        return "high"
    return "good"


def classify_sharpness(score: float) -> str:
    if score < 45:
        return "blurry"
    return "good"


def insightface_bbox_to_dict(bbox: Any) -> Dict[str, int]:
    x1, y1, x2, y2 = [int(round(value)) for value in bbox]
    return {
        "x": max(x1, 0),
        "y": max(y1, 0),
        "width": max(x2 - x1, 0),
        "height": max(y2 - y1, 0),
    }


def normalize_embedding(embedding: np.ndarray) -> List[float]:
    norm = np.linalg.norm(embedding)
    if norm == 0:
        return embedding.astype(float).tolist()
    return (embedding / norm).astype(float).tolist()
