import os
import requests
import json
import time

API_KEY = os.getenv("GOOGLE_API_KEY")

def analyze_plant_disease(image_path):
    """
    Analyzes plant disease using Gemini 1.5 Flash via direct HTTP API.
    """
    if not API_KEY:
        print("Error: GOOGLE_API_KEY not found.")
        return None

    # URL for Gemini 1.5 Flash
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key={API_KEY}"

    try:
        # Read image
        with open(image_path, "rb") as f:
            image_data = f.read()
        
        # Prepare JSON payload (using raw bytes is hard in JSON, so we use blob upload or inline base64? 
        # Actually, simpler to use requests for inline data if small, or just text description if image fails.
        # But wait, we need to send the image.
        # The easiest standard way without library is sending "inlineData".
        import base64
        b64_image = base64.b64encode(image_data).decode("utf-8")
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": "Analyze this plant image. Identify the plant name, disease name (or 'Healthy'), confidence level (0-1), and Provide details: description, prevention, treatment."},
                    {"inline_data": {
                        "mime_type": "image/jpeg",
                        "data": b64_image
                    }}
                ]
            }],
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "OBJECT",
                    "properties": {
                        "plant_name": {"type": "STRING"},
                        "disease_name": {"type": "STRING"},
                        "confidence": {"type": "NUMBER"},
                        "details": {
                            "type": "OBJECT",
                            "properties": {
                                "description": {"type": "STRING"},
                                "prevention": {"type": "STRING"},
                                "treatment": {"type": "STRING"}
                            }
                        }
                    }
                }
            }
        }

        # Send Request
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code != 200:
            print(f"Gemini API Error: {response.text}")
            return None
            
        result = response.json()
        
        # Parse result
        try:
            # "candidates" -> [0] -> "content" -> "parts" -> [0] -> "text"
            text_response = result["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text_response)
        except Exception as e:
            print(f"Error parsing Gemini response: {e}")
            return None

    except Exception as e:
        print(f"Gemini analysis failed: {e}")
        return None

def ask_gemini(query):
    """
    Chat with Gemini using direct HTTP API.
    """
    if not API_KEY:
        return "Error: API Key missing."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": query}]}]
    }

    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        
        if response.status_code != 200:
            return f"Error: {response.text}"

        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]

    except Exception as e:
        return f"Gemini chat failed: {e}"

def translate_text(text, target_language='ta'):
    """
    Translates text using Gemini.
    """
    if not API_KEY:
        return text

    prompt = f"""
    Translate the VALUES in the following JSON to {target_language}.
    Do NOT translate the KEYS.
    Return ONLY legitimate JSON.
    JSON:
    {text}
    """
    
    # Re-use ask_gemini logic but separate function for clarity
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            result = response.json()
            # Clean up potential markdown formatting ```json ... ```
            raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            return raw_text
        return text
    except:
        return text
