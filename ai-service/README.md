---
title: VISO AI Service
emoji: 🧠
colorFrom: emerald
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
---

# VISO AI Service

FastAPI service for VISO face detection, registration, recognition, and image quality checks.

This service only handles computer vision. Employee CRUD and embedding storage stay in the Next.js app and Supabase.

## Setup

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Endpoints

- `GET /`
- `POST /api/face/detect`
- `POST /api/face/register`
- `POST /api/face/recognize`
- `POST /api/face/quality`

InsightFace downloads its model on first use, so the first request can take longer.

## Deploy to Hugging Face Spaces

1. Create a new Space at `https://huggingface.co/spaces`.
2. Choose SDK: `Docker`.
3. Hardware: `CPU Basic` is enough to start.
4. Upload the contents of this `ai-service` folder to the Space repository.
5. In Space Settings, add Variables:

```env
APP_NAME=VISO AI Service
API_PREFIX=/api
CORS_ORIGINS=["https://your-vercel-domain.vercel.app","http://localhost:3000"]
FACE_SIMILARITY_THRESHOLD=0.85
INSIGHTFACE_MODEL_NAME=buffalo_l
INSIGHTFACE_PROVIDERS=["CPUExecutionProvider"]
```

6. Wait for the Space to build.
7. Use the Space URL as `NEXT_PUBLIC_VISO_AI_URL` in Vercel, for example:

```env
NEXT_PUBLIC_VISO_AI_URL=https://username-viso-ai.hf.space
```
