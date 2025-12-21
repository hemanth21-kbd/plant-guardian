import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def analyze_plant_disease(image_path):
    """
    Analyzes a plant image using Gemini Pro Vision to identify disease.
    Returns a dictionary with label, confidence, and details.
    """
    if not api_key:
        print("Error: GOOGLE_API_KEY not found.")
        return None

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Load image
        with open(image_path, "rb") as f:
            image_data = f.read()
            
        image_parts = [
            {
                "mime_type": "image/jpeg", # Assuming jpeg/png, Gemini handles common formats
                "data": image_data
            }
        ]

        prompt = """
        Analyze this plant image. Identify the plant name and any disease it might have.
        If it's healthy, say so.
        Provide the output strictly in this JSON format:
        {
            "plant_name": "Name of plant",
            "disease_name": "Name of disease or 'Healthy'",
            "confidence": 0.95,
            "details": {
                "description": "Brief description of the condition",
                "treatment": "Recommended treatment (organic and chemical)",
                "prevention": "Prevention tips"
            }
        }
        Do not include markdown formatting like ```json. Just the raw JSON string.
        """

        response = model.generate_content([prompt, image_parts[0]])
        
        # Clean response text (remove markdown if present)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text)

    except Exception as e:
        print(f"Gemini analysis failed: {e}")
        return None

def ask_gemini(query):
    """
    Asks Gemini a general gardening question.
    """
    if not api_key:
        return "Error: API Key missing."

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content(query)
        return response.text
    except Exception as e:
        print(f"Gemini chat failed: {e}")
        return "Sorry, I couldn't connect to Google right now."

def translate_text(text, target_language):
    """
    Translates the values within a JSON string to the target language using Gemini.
    """
    if not api_key:
        return text

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"""
        Translate the VALUES in the following JSON to {target_language}.
        Do NOT translate the KEYS.
        Keep the JSON structure exactly the same.
        
        JSON:
        {text}
        
        Return ONLY the raw JSON string, no markdown.
        """
        
        response = model.generate_content(prompt)
        
        translated_text = response.text.strip()
        if translated_text.startswith("```json"):
            translated_text = translated_text[7:]
        if translated_text.endswith("```"):
            translated_text = translated_text[:-3]
            
        return translated_text.strip()
    except Exception as e:
        print(f"Translation failed: {e}")
        return text
