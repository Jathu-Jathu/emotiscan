# train_model.py
import numpy as np
import matplotlib.pyplot as plt
import cv2
import os
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (Conv2D, MaxPooling2D, Dense,
                                     Flatten, Dropout, BatchNormalization)
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.optimizers import Adam

# ── 1. Load images from folder ───────────────────────
EMOTIONS = ['angry','disgust','fear','happy','neutral','sad','surprise']
LABELS   = ['Angry','Disgust','Fear','Happy','Neutral','Sad','Surprise']

def load_images(base_dir):
    images, labels = [], []

    for idx, emotion in enumerate(EMOTIONS):
        # Try lowercase first, then capitalize
        folder = os.path.join(base_dir, emotion)
        if not os.path.exists(folder):
            folder = os.path.join(base_dir, emotion.capitalize())
        if not os.path.exists(folder):
            print(f"  WARNING: {emotion} folder not found, skipping")
            continue

        files = [f for f in os.listdir(folder)
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        print(f"  {LABELS[idx]}: {len(files)} images")

        for fname in files:
            img = cv2.imread(os.path.join(folder, fname), cv2.IMREAD_GRAYSCALE)
            if img is None:
                continue
            # Resize to 48x48 — required input size for our CNN
            img = cv2.resize(img, (48, 48)).astype('float32') / 255.0
            images.append(img)
            labels.append(idx)

    # Reshape to (samples, height, width, channels)
    return np.array(images).reshape(-1, 48, 48, 1), np.array(labels)

print("Loading TRAIN images...")
X_train, y_train = load_images('train')
print(f"Total train images: {len(X_train)}\n")

print("Loading TEST images...")
X_test, y_test = load_images('test')
print(f"Total test images: {len(X_test)}\n")

# Convert integer labels to one-hot vectors
# Example: label 3 (Happy) → [0, 0, 0, 1, 0, 0, 0]
y_train_cat = to_categorical(y_train, num_classes=7)
y_test_cat  = to_categorical(y_test,  num_classes=7)

# ── 2. Build CNN Model ───────────────────────────────
# Each Conv2D block learns increasingly complex features:
# Block 1 → edges and lines
# Block 2 → shapes and curves
# Block 3 → facial features (eyes, mouth, nose)

model = Sequential([
    # Block 1
    Conv2D(32, (3,3), activation='relu', padding='same', input_shape=(48, 48, 1)),
    BatchNormalization(),   # stabilizes training
    Conv2D(32, (3,3), activation='relu', padding='same'),
    MaxPooling2D(2, 2),    # reduce size: 48x48 → 24x24
    Dropout(0.25),         # prevent overfitting

    # Block 2
    Conv2D(64, (3,3), activation='relu', padding='same'),
    BatchNormalization(),
    Conv2D(64, (3,3), activation='relu', padding='same'),
    MaxPooling2D(2, 2),    # 24x24 → 12x12
    Dropout(0.25),

    # Block 3
    Conv2D(128, (3,3), activation='relu', padding='same'),
    BatchNormalization(),
    Conv2D(128, (3,3), activation='relu', padding='same'),
    MaxPooling2D(2, 2),    # 12x12 → 6x6
    Dropout(0.25),

    # Flatten 3D feature maps into 1D vector
    Flatten(),

    # Fully connected layers for classification
    Dense(256, activation='relu'),
    BatchNormalization(),
    Dropout(0.5),
    Dense(128, activation='relu'),
    Dropout(0.3),

    # Output layer — 7 neurons, one per emotion
    # Softmax converts raw scores to probabilities (sum = 1.0)
    Dense(7, activation='softmax')
])

model.summary()

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',   # standard loss for multi-class classification
    metrics=['accuracy']
)

# ── 3. Callbacks ─────────────────────────────────────
callbacks = [
    # Stop training if validation accuracy doesn't improve for 10 epochs
    EarlyStopping(monitor='val_accuracy', patience=10,
                  restore_best_weights=True, verbose=1),
    # Save the best model to disk automatically
    ModelCheckpoint('best_model.h5', monitor='val_accuracy',
                    save_best_only=True, verbose=1)
]

# ── 4. Train ─────────────────────────────────────────
print("Training started... (this takes 20-30 minutes on CPU)")
history = model.fit(
    X_train, y_train_cat,
    epochs=50,           # maximum training rounds
    batch_size=64,       # process 64 images at a time
    validation_data=(X_test, y_test_cat),
    callbacks=callbacks,
    verbose=1
)

best = max(history.history['val_accuracy'])
print(f"\nBest validation accuracy: {best * 100:.1f}%")
print("Model saved as best_model.h5")

# ── 5. Save training graphs ──────────────────────────
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['accuracy'],     label='Train')
plt.plot(history.history['val_accuracy'], label='Test')
plt.title('Accuracy over epochs')
plt.xlabel('Epoch'); plt.ylabel('Accuracy')
plt.legend(); plt.grid(alpha=0.3)

plt.subplot(1, 2, 2)
plt.plot(history.history['loss'],     label='Train')
plt.plot(history.history['val_loss'], label='Test')
plt.title('Loss over epochs')
plt.xlabel('Epoch'); plt.ylabel('Loss')
plt.legend(); plt.grid(alpha=0.3)

plt.tight_layout()
plt.savefig('training_history.png')
print("Training graph saved as training_history.png")