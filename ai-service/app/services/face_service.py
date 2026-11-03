import json
from typing import Any, Dict, List, Optional

import numpy as np
from insightface.app import FaceAnalysis

from app.core.config import get_settings
from app.utils.image import (
    calculate_brightness,
    calculate_sharpness,
    classify_brightness,
    classify_sharpness,
    insightface_bbox_to_dict,
    normalize_embedding,
)


class FaceService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.model: Optional[FaceAnalysis] = None

    def load_model(self) -> None:
        if self.model is not None:
            return

        self.model = FaceAnalysis(
            name=self.settings.insightface_model_name,
            providers=self.settings.insightface_providers,
        )
        self.model.prepare(ctx_id=-1, det_size=(640, 640))

    def detect_faces(self, image: np.ndarray) -> List[Any]:
        self.load_model()
        if self.model is None:
            raise RuntimeError("Face model is not available")
        return self.model.get(image)

    def detect(self, image: np.ndarray) -> Dict[str, Any]:
        faces = self.detect_faces(image)
        face_count = len(faces)

        if face_count == 0:
            return {"success": False, "message": "No face detected", "face_count": 0}

        if face_count > 1:
            return {
                "success": False,
                "message": "Multiple faces detected",
                "face_count": face_count,
                "faces": [insightface_bbox_to_dict(face.bbox) for face in faces],
            }

        return {
            "success": True,
            "face_count": face_count,
            "faces": [insightface_bbox_to_dict(face.bbox) for face in faces],
        }

    def register(self, image: np.ndarray) -> Dict[str, Any]:
        faces = self.detect_faces(image)
        quality = self.quality(image, faces)

        if len(faces) == 0:
            return {"success": False, "message": "No face detected", "face_count": 0, "quality": quality}

        if len(faces) > 1:
            return {"success": False, "message": "Multiple faces detected", "face_count": len(faces), "quality": quality}

        embedding = normalize_embedding(faces[0].embedding)

        return {
            "success": True,
            "embedding": embedding,
            "model": "insightface",
            "quality": {
                "face_detected": True,
                "face_count": 1,
                "brightness": quality["brightness"],
                "sharpness": quality["sharpness"],
            },
        }

    def recognize(self, image: np.ndarray, embeddings_json: str) -> Dict[str, Any]:
        known_faces = self._parse_embeddings(embeddings_json)
        faces = self.detect_faces(image)

        if len(faces) == 0:
            return {"success": False, "message": "No face detected", "face_count": 0}

        if len(faces) > 1:
            return {"success": False, "message": "Multiple faces detected", "face_count": len(faces)}

        if not known_faces:
            return {"success": True, "matched": False, "message": "No registered embeddings provided", "confidence": 0.0}

        query_embedding = np.array(normalize_embedding(faces[0].embedding), dtype=np.float32)
        best_match: Optional[Dict[str, Any]] = None
        best_score = -1.0

        for employee in known_faces:
            employee_embedding = np.array(employee["embedding"], dtype=np.float32)
            score = self._cosine_similarity(query_embedding, employee_embedding)

            if score > best_score:
                best_score = score
                best_match = employee

        confidence = round(float(best_score), 4)

        if best_match and confidence >= self.settings.face_similarity_threshold:
            return {
                "success": True,
                "matched": True,
                "employee_id": best_match["employee_id"],
                "full_name": best_match.get("full_name", ""),
                "confidence": confidence,
            }

        return {"success": True, "matched": False, "message": "Unknown face", "confidence": confidence}

    def quality(self, image: np.ndarray, faces: Optional[List[Any]] = None) -> Dict[str, Any]:
        brightness_score = calculate_brightness(image)
        sharpness_score = calculate_sharpness(image)
        face_count = len(faces) if faces is not None else len(self.detect_faces(image))

        return {
            "success": True,
            "brightness_score": round(brightness_score, 2),
            "sharpness_score": round(sharpness_score, 2),
            "brightness": classify_brightness(brightness_score),
            "sharpness": classify_sharpness(sharpness_score),
            "face_count": face_count,
        }

    def _parse_embeddings(self, embeddings_json: str) -> List[Dict[str, Any]]:
        try:
            parsed = json.loads(embeddings_json)
        except json.JSONDecodeError as exc:
            raise ValueError("embeddings must be a valid JSON array") from exc

        if not isinstance(parsed, list):
            raise ValueError("embeddings must be a JSON array")

        valid_items: List[Dict[str, Any]] = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            if not item.get("employee_id") or not isinstance(item.get("embedding"), list):
                continue
            valid_items.append(item)

        return valid_items

    def _cosine_similarity(self, first: np.ndarray, second: np.ndarray) -> float:
        first_norm = np.linalg.norm(first)
        second_norm = np.linalg.norm(second)

        if first_norm == 0 or second_norm == 0:
            return 0.0

        return float(np.dot(first, second) / (first_norm * second_norm))


face_service = FaceService()
