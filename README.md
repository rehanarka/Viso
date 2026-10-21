# VISO

Smart Attendance Management System built with Next.js, Supabase, and a separate FastAPI AI service for face recognition.

## Next.js App

```bash
npm run dev
```

Open `http://localhost:3000`.

Required local env:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VISO_AI_URL=http://127.0.0.1:8000
```

Optional Vercel keepalive env:

```env
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
CRON_SECRET=your_random_cron_secret
```

The keepalive route is `/api/keepalive`. Vercel Cron calls it daily from `vercel.json` so Supabase receives a lightweight database query.

## AI Service

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The AI service handles face detection, face registration, face recognition, and image quality checks only. Employee CRUD and embedding storage stay in Next.js and Supabase.

## Supabase

Run `supabase-onboarding-rpc.sql` in Supabase SQL Editor after schema changes. It includes employee onboarding helpers and face embedding RPCs used by the employee attendance flow.
