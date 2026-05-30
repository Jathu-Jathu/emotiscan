# 🎭 EmotiScan — Real-Time Facial Emotion Recognition

> AI-powered emotion detection using CNN + FastAPI + Next.js

## ✨ Features

- 🎥 **Live camera feed** — real-time face detection
- 🧠 **CNN model** — trained on FER2013 dataset (28,000+ images)
- 😄 **7 emotions** — Angry, Disgust, Fear, Happy, Neutral, Sad, Surprise
- 📊 **Confidence chart** — probability breakdown for all emotions
- 🕐 **Detection history** — last 12 predictions with timestamps
- 🔢 **Streak counter** — tracks consecutive same emotions
- 🗣 **Voice alert** — speaks detected emotion aloud
- 🔔 **Sound beep** — audio cue on emotion change
- 📦 **REST API** — FastAPI backend with `/predict` endpoint

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python, Uvicorn |
| ML Model | TensorFlow / Keras (CNN) |
| CV | OpenCV (face detection) |
| Dataset | FER2013 (Kaggle) |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/emotiscan.git
cd emotiscan
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install fastapi uvicorn python-multipart opencv-python tensorflow numpy
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in browser

http://localhost:3000

---

## 🧠 Model Architecture

Input (48×48 grayscale)
│
├── Conv2D(32) → BatchNorm → Conv2D(32) → MaxPool → Dropout
├── Conv2D(64) → BatchNorm → Conv2D(64) → MaxPool → Dropout
├── Conv2D(128) → BatchNorm → Conv2D(128) → MaxPool → Dropout
│
├── Flatten → Dense(256) → BatchNorm → Dropout
├── Dense(128) → Dropout
│
└── Dense(7, softmax) → Emotion class

---

## 🔧 How It Works

Camera Frame
↓
OpenCV Face Detection (Haar Cascade)
↓
Crop + Resize (48×48) + Grayscale + Normalize
↓
CNN Model Prediction
↓
JSON Response → Next.js UI

---

## 📸 Screenshots

---

<p align="center">Built with ❤️ using Python, FastAPI & Next.js</p>