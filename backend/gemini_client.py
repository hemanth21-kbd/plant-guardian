import os
import requests
import json
import base64
import mimetypes
import time

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

def try_google_gemini(image_path):
    if not API_KEY: return None
    
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type: mime_type = "image/jpeg"
    
    # Try the most stable model first
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    
    try:
        with open(image_path, "rb") as f:
            b64_image = base64.b64encode(f.read()).decode("utf-8")
            
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Analyze this plant image. Return JSON with keys: plant_name, disease_name, confidence, details (description, prevention, treatment)."},
                    {"inline_data": {"mime_type": mime_type, "data": b64_image}}
                ]
            }],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=15)
        
        if response.status_code == 200:
            text = response.json()["candidates"][0]["content"]["parts"][0]["text"]
            text = text.replace("```json", "").replace("```", "").strip()
            return json.loads(text)
        else:
            print(f"Gemini Error: {response.status_code} {response.text}")
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
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    try:
        res = requests.post(url, json={"contents": [{"parts": [{"text": query}]}]})
        if res.status_code == 200:
            return res.json()["candidates"][0]["content"]["parts"][0]["text"]
    except:
        pass
    return "I am unable to connect to the brain right now. Please try again."

def translate_text(text, target):
    return text
