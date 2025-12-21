import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from pathlib import Path

class DiseaseDetector:
    def __init__(self):
        self.model_path = Path("models/plant_disease_model.keras")
        self.indices_path = Path("models/class_indices.json")
        self.model = None
        self.class_indices = None
        self.class_names = []
        
        self._load_resources()

    def _load_resources(self):
        try:
            if self.model_path.exists():
                print(f"Loading model from {self.model_path}...")
                self.model = load_model(self.model_path)
                print("Model loaded successfully.")
            else:
                print(f"Warning: Model file not found at {self.model_path}. Inference will fail.")

            if self.indices_path.exists():
                with open(self.indices_path, "r") as f:
                    self.class_indices = json.load(f)
                    # Create a list of class names where index matches the list index
                    # class_indices is {name: index}
                    self.class_names = [None] * len(self.class_indices)
                    for name, index in self.class_indices.items():
                        self.class_names[index] = name
                print(f"Loaded {len(self.class_names)} class indices.")
            else:
                print(f"Warning: Class indices file not found at {self.indices_path}.")
                
        except Exception as e:
            print(f"Error loading resources: {e}")

    def predict(self, image_path):
        if not self.model or not self.class_names:
            # Try reloading if missing (maybe training just finished)
            self._load_resources()
            if not self.model or not self.class_names:
                return {"label": "Error: Model not loaded", "confidence": 0.0}

        try:
            # Preprocess image
            img = image.load_img(image_path, target_size=(160, 160))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)

            # Predict
            predictions = self.model.predict(img_array)
            predicted_index = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_index])
            predicted_label = self.class_names[predicted_index]

            if confidence < 0.4:
                return {
                    "label": "Unknown",
                    "confidence": confidence,
                    "original_label": predicted_label
                }

            return {
                "label": predicted_label,
                "confidence": confidence
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return {"label": "Error: Prediction failed", "confidence": 0.0}

detector = DiseaseDetector()
