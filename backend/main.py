# backend/main.py
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from tensorflow.keras.models import load_model

app = FastAPI(title="Emotion Recognition API")

# Allow requests from Next.js frontend running on port 3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once when the server starts (not on every request)
print("Loading ML model...")
model = load_model("best_model.h5")

# OpenCV built-in face detector using Haar Cascade
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)
print("Server ready!")

EMOTIONS = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"]
EMOJIS   = ["😠",    "🤢",      "😨",   "😄",    "😐",      "😢",  "😲"]


@app.get("/")
def root():
    # Health check — visit http://localhost:8000 to confirm server is running
    return {"status": "ok", "message": "Emotion API is running!"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Receives an image file from the frontend.
    Detects a face, runs the CNN model, returns emotion as JSON.
    """

    # Step 1: Read uploaded bytes and decode into an image array
    contents  = await file.read()
    img_array = np.frombuffer(contents, np.uint8)
    image     = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "error": "Could not read image file"}

    # Step 2: Convert to grayscale for face detection
    gray  = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Step 3: Detect faces in the image
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,    # how much image size is reduced at each scale
        minNeighbors=5,     # higher = fewer false positives
        minSize=(30, 30)    # minimum face size to detect
    )

    if len(faces) == 0:
        return {"success": False, "error": "No face detected — try a clearer photo"}

    # Step 4: Take the first detected face and preprocess it
    x, y, w, h = faces[0]
    face = gray[y:y+h, x:x+w]                     # crop face region
    face = cv2.resize(face, (48, 48))              # resize to model input size
    face = face.astype("float32") / 255.0          # normalize 0-255 → 0-1
    face = face.reshape(1, 48, 48, 1)              # add batch + channel dimensions

    # Step 5: Run prediction
    preds   = model.predict(face, verbose=0)[0]    # array of 7 probabilities
    top_idx = int(np.argmax(preds))                # index of highest probability

    # Step 6: Return result as JSON
    return {
        "success":    True,
        "emotion":    EMOTIONS[top_idx],
        "emoji":      EMOJIS[top_idx],
        "confidence": round(float(preds[top_idx]) * 100, 1),
        "all_scores": {
            EMOTIONS[i]: round(float(preds[i]) * 100, 1)
            for i in range(7)
        }
    }