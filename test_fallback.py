import sys
import os
from dotenv import load_dotenv

# Add current directory to sys.path
sys.path.append(os.getcwd())

# Load env vars
load_dotenv()

from backend.ml_engine import detector
from backend import gemini_client

# Path to the uploaded image
image_path = r"C:/Users/hp/.gemini/antigravity/brain/6ddf77a4-6708-46b1-9c1a-26b14f395c3e/uploaded_image_1764691325499.png"

if not os.path.exists(image_path):
    print(f"Error: Image not found at {image_path}")
    sys.exit(1)

print(f"Testing full flow on: {image_path}")

# 1. Local Prediction
print("\n--- Step 1: Local Model Prediction ---")
local_result = detector.predict(image_path)
print(f"Local Result: {local_result}")

# 2. Fallback Logic
if local_result['label'] == 'Unknown':
    print("\n--- Step 2: Fallback to Gemini ---")
    print("Local model returned Unknown. Calling Gemini...")
    
    gemini_result = gemini_client.analyze_plant_disease(image_path)
    
    if gemini_result:
        print("\nSUCCESS: Gemini returned a result!")
        print(f"Plant: {gemini_result.get('plant_name')}")
        print(f"Disease: {gemini_result.get('disease_name')}")
        print(f"Confidence: {gemini_result.get('confidence')}")
        print(f"Details: {gemini_result.get('details')}")
    else:
        print("\nFAILURE: Gemini returned None.")
else:
    print("\nLocal model was confident enough. No fallback needed (unexpected for this image).")
