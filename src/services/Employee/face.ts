const AI_SERVICE_URL = process.env.NEXT_PUBLIC_VISO_AI_URL || "http://127.0.0.1:8000";
const AI_REQUEST_TIMEOUT_MS = 60000;
const AI_WAKEUP_MAX_ATTEMPTS = 3;
const AI_WAKEUP_RETRY_DELAY_MS = 3000;

function isColdStartStatus(status: number) {
  return status === 502 || status === 503 || status === 504;
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export type RegisterFaceResponse = {
  success: boolean;
  embedding?: number[];
  model?: string;
  message?: string;
  quality?: {
    face_detected?: boolean;
    face_count: number;
    brightness: string;
    sharpness: string;
  };
};

export type RecognizeFaceResponse = {
  success: boolean;
  matched?: boolean;
  employee_id?: string;
  full_name?: string;
  confidence?: number;
  message?: string;
};

async function postImage<T>(endpoint: string, image: Blob, fields?: Record<string, string>): Promise<T> {
  const formData = new FormData();
  formData.append("file", image, "face.jpg");
  Object.entries(fields || {}).forEach(([key, value]) => formData.append(key, value));

  const url = `${AI_SERVICE_URL}${endpoint}`;

  for (let attempt = 1; attempt <= AI_WAKEUP_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
    const isLastAttempt = attempt >= AI_WAKEUP_MAX_ATTEMPTS;

    try {
      const response = await fetch(url, {
        body: formData,
        method: "POST",
        signal: controller.signal,
      });

      const rawBody = await response.text();
      let payload: unknown = null;

      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          payload = null;
        }
      }

      const detail = payload && typeof payload === "object" && "detail" in payload ? (payload as { detail?: unknown }).detail : undefined;
      const detailMessage = typeof detail === "string" && detail ? detail : "";

      if (isColdStartStatus(response.status)) {
        if (!isLastAttempt) {
          await wait(AI_WAKEUP_RETRY_DELAY_MS * attempt);
          continue;
        }

        throw new Error("AI service is waking up or unavailable right now. Please wait a moment, then try registering your face again.");
      }

      if (!response.ok) {
        throw new Error(detailMessage || `AI service request failed (${response.status}).`);
      }

      if (!payload) {
        throw new Error("AI service returned an empty response.");
      }

      return payload as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("AI service took too long. The first InsightFace request may still be downloading or loading the model. Check the FastAPI terminal, then try again.");
      }

      if (error instanceof TypeError && !isLastAttempt) {
        await wait(AI_WAKEUP_RETRY_DELAY_MS * attempt);
        continue;
      }

      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw new Error("AI service is not reachable. Check your connection or that the AI Space is running.");
}

export function registerFaceImage(image: Blob) {
  return postImage<RegisterFaceResponse>("/api/face/register", image);
}

export function recognizeOwnFace(image: Blob, employees: { employee_id: string; full_name: string; embedding: number[] }[]) {
  return postImage<RecognizeFaceResponse>("/api/face/recognize", image, {
    embeddings: JSON.stringify(employees),
  });
}
