import os
import requests
import json
import base64
import mimetypes

API_KEY = os.getenv("GOOGLE_API_KEY")

def analyze_plant_disease(image_path):
    """
    Analyzes plant disease using Gemini 1.5 Flash via direct HTTP API.
    Handles PNG/JPEG correctly and works without the deprecated library.
    """
    if not API_KEY:
        print("Error: GOOGLE_API_KEY not found.")
        return get_mock_result()

    # Determine correct MIME type (Essential for PNG vs JPEG)
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type:
        mime_type = "image/jpeg" # Default fallback
    
    print(f"Analyzing Image: {image_path} with Mime: {mime_type}")

    # Use the Standard 1.5 Flash Model (Reliable)
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    
    try:
        # Read and Encode Image
        with open(image_path, "rb") as f:
            image_data = f.read()
            b64_image = base64.b64encode(image_data).decode("utf-8")
        
        # Construct Payload
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Analyze this plant image. Return legitimate JSON with keys: plant_name, disease_name (or 'Healthy'), confidence (0.0-1.0), details (description, prevention, treatment)."},
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

        # Send Request
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code == 200:
            result = response.json()
            try:
                text_response = result["candidates"][0]["content"]["parts"][0]["text"]
                text_response = text_response.replace("```json", "").replace("```", "").strip()
                return json.loads(text_response)
            except Exception as e:
                print(f"Parsing Error: {e}")
                pass
        else:
            print(f"Gemini API Failed: {response.status_code} {response.text}")

    except Exception as e:
        print(f"Gemini Connection Error: {e}")

    # Fallback to Mock if it fails
    return get_mock_result()

def get_mock_result():
    return {
        "plant_name": "Unknown (Server Busy)",
        "disease_name": "Could not analyze",
        "confidence": 0.0,
        "details": {
            "description": "The AI is currently starting up or busy. Please try again in 1 minute.",
            "prevention": "Wait a moment.",
            "treatment": "Retry."
        }
    }

def ask_gemini(query):
    if not API_KEY: return "Error: API Key missing."
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": query}]}]}
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            return response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return f"Error: {response.text}"
    except Exception as e:
        return f"Chat Error: {e}"

def translate_text(text, target_language='ta'):
    if not API_KEY: return text
    
    prompt = f"Translate values to {target_language}. Return ONLY legitimate JSON. Input: {text}"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={API_KEY}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            result = response.json()
            raw = result["candidates"][0]["content"]["parts"][0]["text"]
            return raw.replace("```json", "").replace("```", "").strip()
        return text
    except:
        return text
