import os
import google.generativeai as genai
import time
from PIL import Image

API_KEY = os.getenv("GOOGLE_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)

def analyze_plant_disease(image_path):
    """
    Analyzes plant disease using the standard Google Gemini Library.
    Restored to the classic, working method.
    """
    if not API_KEY:
        print("Error: GOOGLE_API_KEY not found.")
        return get_mock_result()

    try:
        # Use the Stable 1.5 Flash model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Load image using PIL (Handles PNG/JPG automatically)
        img = Image.open(image_path)
        
        prompt = "Analyze this plant image. Return legitimate JSON with keys: plant_name, disease_name (or 'Healthy'), confidence (0.0-1.0), details (description, prevention, treatment)."
        
        # Determine MIME type helper (optional, PIL handles it mostly, but genai likes to know)
        # We pass the PIL image directly to the library!
        response = model.generate_content([prompt, img])
        
        if response.text:
            import json
            text_response = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(text_response)
            
    except Exception as e:
        print(f"Gemini Library Error: {e}")
        # Fallback to Mock if it fails
        return get_mock_result()

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
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(query)
        return response.text
    except Exception as e:
        return f"Chat Error: {e}"

def translate_text(text, target_language='ta'):
    if not API_KEY: return text
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Translate values to {target_language}. JSON: {text}"
        response = model.generate_content(prompt)
        return response.text.replace("```json", "").replace("```", "").strip()
    except:
        return text
