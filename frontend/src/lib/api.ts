// src/lib/api.ts
// All backend communication lives here — one place to manage API calls

const API = process.env.NEXT_PUBLIC_API_URL  // reads from .env.local

// Type definition for the response we get from FastAPI
export type EmotionResult =
  | {
      success: true
      emotion: string
      emoji: string
      confidence: number
      all_scores: Record<string, number>   // { "Happy": 89.3, "Sad": 3.2, ... }
    }
  | {
      success: false
      error: string
    }

// Send a video frame (captured as a Blob) to the backend for prediction
export async function predictFromBlob(blob: Blob): Promise<EmotionResult> {
  const form = new FormData()
  form.append("file", blob, "frame.jpg")   // "file" must match FastAPI parameter name

  const res = await fetch(`${API}/predict`, {
    method: "POST",
    body: form
    // Do NOT set Content-Type header — browser sets it automatically with boundary
  })

  if (!res.ok) throw new Error(`Server error: ${res.status}`)
  return res.json()
}