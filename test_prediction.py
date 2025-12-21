import sys
import os

# Add the current directory to sys.path so we can import backend
sys.path.append(os.getcwd())

from backend.ml_engine import detector

# Path to the uploaded image (from metadata)
image_path = r"C:/Users/hp/.gemini/antigravity/brain/6ddf77a4-6708-46b1-9c1a-26b14f395c3e/uploaded_image_1764691325499.png"

if not os.path.exists(image_path):
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

print(f"Testing prediction on: {image_path}")
result = detector.predict(image_path)
print("Prediction Result:")
print(result)

if result['label'] == 'Unknown':
    print("SUCCESS: Low confidence prediction correctly handled as Unknown.")
else:
    print(f"FAILURE: Prediction label is {result['label']} with confidence {result['confidence']}")
