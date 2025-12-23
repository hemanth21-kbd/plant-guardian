import os
import requests
import json
import base64

API_KEY = os.getenv("GOOGLE_API_KEY")

def analyze_plant_disease(image_path):
    """
    Analyzes plant disease using a cascade of Gemini models.
    Falls back to a 'Demo Result' if all AI models fail.
    """
    if not API_KEY:
        print("Error: GOOGLE_API_KEY not found.")
        return get_mock_result()

    # List of models to try in order
    models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-pro-vision"
    ]

    # Read image once
    try:
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
                        "mime_type": "image/jpeg",
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
                    pass # Parse error, try next model
            else:
                print(f"Failed {model_name}: {response.status_code} {response.text}")
        except Exception:
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
    # Simplified chat with failover
    if not API_KEY: return "Error: API Key missing."
    
    models = ["gemini-1.5-flash", "gemini-pro"]
    for model in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        payload = {"contents": [{"parts": [{"text": query}]}]}
        try:
            response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
            if response.status_code == 200:
                return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        except:
            continue
    return "Sorry, I am having trouble connecting to Google right now."

def translate_text(text, target_language='ta'):
    # Translation with failover
    prompt = f"Translate values to {target_language}. JSON: {text}"
    result = ask_gemini(prompt)
    if "Sorry" in result: return text
    try:
        return result.replace("```json", "").replace("```", "").strip()
    except:
        return text
