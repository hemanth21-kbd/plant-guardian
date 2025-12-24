import os
import requests
import json
import base64
import mimetypes
import time
from dotenv import load_dotenv

load_dotenv()


API_KEY = os.getenv("GOOGLE_API_KEY")
HF_API_KEY = os.getenv("HF_API_KEY") # Optional: Add if you have one

def analyze_plant_disease(image_path):
    """
    Main Analysis Function.
    Strategy:
    1. Try Google Gemini (Best Accuracy).
    2. Fallback to Hugging Face (Good for Description).
    3. Return Safe Default (Never Crash).
    """
    print(f"Starting Analysis for {image_path}...")
    
    # 1. Try Google Gemini
    result = try_google_gemini(image_path)
    if result:
        return result

    print("Google Gemini failed/blocked. Switching to Backup AI (Hugging Face)...")

    # 2. Try Hugging Face (Backup)
    result = try_hugging_face(image_path)
    if result:
        return result

    # 3. Final Fallback
    print("All AI services failed. Returning Static Result.")
    return get_mock_result()

import google.generativeai as genai

# Configure Gemini
if API_KEY:
    genai.configure(api_key=API_KEY)

def try_google_gemini(image_path):
    if not API_KEY: return None
    
    print(f"Using Google Gemini (Model: gemini-flash-latest) for {image_path}...")
    
    try:
        # Prepare the model
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Load image
        with open(image_path, "rb") as f:
            data = f.read()

        # The SDK can accept bytes directly using a dictionary format or slightly inconsistent ways depending on version
        # Safest is PIL or the dictionary format: {'mime_type': 'image/jpeg', 'data': bytes}
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type: mime_type = "image/jpeg"
        
        image_part = {"mime_type": mime_type, "data": data}
        
        prompt = "Analyze this plant image. Return JSON with keys: plant_name, disease_name, confidence, details (description, prevention, treatment)."
        
        # execution
        response = model.generate_content(
            [prompt, image_part],
            generation_config={"response_mime_type": "application/json"}
        )
        
        text = response.text
        # Cleanup potential markdown wrappers just in case
        text = text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
            
    except Exception as e:
        print(f"Gemini Exception: {e}")
    
    return None

def try_hugging_face(image_path):
    # Uses Salesforce BLIP for Image Captioning (Free/Public Model)
    API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    
    headers = {}
    if HF_API_KEY:
        headers["Authorization"] = f"Bearer {HF_API_KEY}"
    
    try:
        with open(image_path, "rb") as f:
            data = f.read()
        
        response = requests.post(API_URL, headers=headers, data=data, timeout=20)
        
        if response.status_code == 200:
            # Result is like: [{"generated_text": "a close up of a tomato plant with yellow leaves"}]
            description = response.json()[0].get("generated_text", "Plant detected")
            
            print(f"HuggingFace Success: {description}")
            
            # Map description to our JSON format
            return {
                "plant_name": "Plant Detected (Backup AI)",
                "disease_name": "Visual Analysis Complete",
                "confidence": 0.85,
                "details": {
                    "description": f"AI Analysis: {description}. (Using Backup Model due to Google connection limits).",
                    "prevention": "Ensure proper watering and sunlight.",
                    "treatment": "Consult a local agriculturist for specific chemical treatments."
                }
            }
        else:
            print(f"HuggingFace Error: {response.status_code}")
    except Exception as e:
        print(f"HuggingFace Exception: {e}")

    return None

def get_mock_result():
    return {
        "plant_name": "Server Unavailable",
        "disease_name": "Check Connection",
        "confidence": 0.0,
        "details": {
            "description": "We could not connect to any AI service at this moment. Please check server logs.",
            "prevention": "Try again later.",
            "treatment": "Restart App."
        }
    }

def ask_gemini(query):
    # Simple chat fallback
    if not API_KEY: return "AI Service Unavailable (Key Missing)"
    
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(query)
        return response.text
    except Exception as e:
        print(f"Chat Error: {e}")
        pass
    return "I am unable to connect to the brain right now. Please try again."

def translate_text(text, target):
    return text
