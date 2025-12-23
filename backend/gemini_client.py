import os
import requests
import json
import base64
import mimetypes

API_KEY = os.getenv("GOOGLE_API_KEY")

def analyze_plant_disease(image_path):
    """
    Analyzes plant disease using Gemini 1.5 Flash via direct HTTP API.
    Handles PNG/JPEG correctly and retries multiple models.
    """
    if not API_KEY:
        print("Error: GOOGLE_API_KEY not found.")
        return get_mock_result()

    # Determine correct MIME type (Essential for PNG vs JPEG)
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type:
        mime_type = "image/jpeg"
    
    print(f"Analyzing Image: {image_path} with Mime: {mime_type}")

    # List of models to try in order (Updated to valid 1.5 versions)
    models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro"
    ]

    try:
        # Read image
        with open(image_path, "rb") as f:
            image_data = f.read()
            b64_image = base64.b64encode(image_data).decode("utf-8")
    except Exception as e:
        print(f"Error reading image: {e}")
        return None

    for model_name in models:
        print(f"Trying model: {model_name}...")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Analyze this plant image. Return JSON with keys: plant_name, disease_name, confidence, details (description, prevention, treatment)."},
                    {"inline_data": {
                        "mime_type": mime_type,
                        "data": b64_image
                    }}
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }

        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            
            if response.status_code == 200:
                result = response.json()
                try:
                    text_response = result["candidates"][0]["content"]["parts"][0]["text"]
                    # Clean markdown
                    text_response = text_response.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(text_response)
                    print(f"Success with {model_name}!")
                    return parsed
                except:
                    pass # Parse error
            else:
                print(f"Failed {model_name}: {response.status_code} {response.text}")
        except Exception as e:
            print(f"Exception for {model_name}: {e}")
            pass
    
    # If all failed: return Mock Result (Demo Mode)
    print("All AI models failed. Returning Demo Result.")
    return get_mock_result()

def get_mock_result():
    return {
        "plant_name": "Unknown Plant (AI Busy)",
        "disease_name": "Analysis Failed",
        "confidence": 0.0,
        "details": {
            "description": "The AI service is currently unavailable. Please check your internet or API Key.",
            "prevention": "Ensure server is running.",
            "treatment": "Try again later."
        }
    }

def ask_gemini(query):
    # Chat with failover
    if not API_KEY: return "Error: API Key missing."
    
    # Use 1.5 Flash for chat too (Pro is old)
    models = ["gemini-1.5-flash", "gemini-1.5-pro"]
    
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        payload = {"contents": [{"parts": [{"text": query}]}]}
        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            if response.status_code == 200:
                result = response.json()
                return result["candidates"][0]["content"]["parts"][0]["text"]
        except:
            continue
    return "Sorry, I am having trouble connecting to Google right now."

def translate_text(text, target_language='ta'):
    # Translation
    if not API_KEY: return text
    
    prompt = f"Translate values to {target_language}. Return ONLY JSON. Input: {text}"
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            result = response.json()
            raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
            return raw_text.replace("```json", "").replace("```", "").strip()
        return text
    except:
        return text
