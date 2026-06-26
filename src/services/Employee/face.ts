const AI_SERVICE_URL = process.env.NEXT_PUBLIC_VISO_AI_URL || "http://127.0.0.1:8000";
const AI_REQUEST_TIMEOUT_MS = 60000;

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
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  const formData = new FormData();
  formData.append("file", image, "face.jpg");
  Object.entries(fields || {}).forEach(([key, value]) => formData.append(key, value));

  try {
    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      body: formData,
      method: "POST",
      signal: controller.signal,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.detail || "AI service request failed.");
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("AI service took too long. The first InsightFace request may still be downloading or loading the model. Check the FastAPI terminal, then try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function registerFaceImage(image: Blob) {
  return postImage<RegisterFaceResponse>("/api/face/register", image);
}

export function recognizeOwnFace(image: Blob, employees: { employee_id: string; full_name: string; embedding: number[] }[]) {
  return postImage<RecognizeFaceResponse>("/api/face/recognize", image, {
    embeddings: JSON.stringify(employees),
  });
}
