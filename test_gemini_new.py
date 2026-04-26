import os
import sys
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())

load_dotenv()

from backend import groq_client

# Use a test image if exists, or just check initialization
image_path = "test_plant.jpg" # This might not exist, but let's check API config
if not os.path.exists(image_path):
    # Try to find any image in uploads
    uploads_dir = "backend/uploads"
    if os.path.exists(uploads_dir):
        files = [f for f in os.listdir(uploads_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if files:
            image_path = os.path.join(uploads_dir, files[0])

print(f"Testing Gemini Client with image: {image_path}")

try:
    if os.path.exists(image_path):
        result = groq_client.analyze_plant_disease(image_path)
        print("Analysis Result:")
        print(result)
    else:
        print("No test image found, checking API key only.")
        if os.getenv("GOOGLE_API_KEY"):
            print("GOOGLE_API_KEY is present.")
        else:
            print("GOOGLE_API_KEY is MISSING!")
except Exception as e:
    print(f"Error during test: {e}")
