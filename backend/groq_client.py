import os
import json
import base64
import requests
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")

# Configure Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

def analyze_plant_disease(image_path):
    """
    Main Analysis Entry Point.
    Checks for Plant.id (dedicated API) first, then Gemini (general AI),
    finally falls back to local threshold analysis.
    """
    print(f"Starting Analysis for {image_path}...")
    
    # 1. Try Plant.id (Dedicated Plant Disease API) - High Accuracy
    if PLANT_ID_API_KEY:
        print("Using Plant.id API...")
        plant_id_result = try_plant_id_api(image_path)
        if plant_id_result:
            return plant_id_result
    
    # 2. Try Google Gemini (Vision AI) - High Accuracy
    if GOOGLE_API_KEY:
        print("Using Google Gemini API...")
        gemini_result = try_gemini_analysis(image_path)
        if gemini_result:
            return gemini_result
            
    # 3. Final Fallback: Local Pixel Analysis - Low Accuracy
    print("Warning: No valid API keys found. Falling back to primitive local analysis.")
    return local_plant_analysis(image_path)

def try_plant_id_api(image_path):
    """Implementation for Kindwise Plant.id (Nature.id) API v3."""
    try:
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        
        url = "https://plant.id/api/v3/identification"
        headers = {
            "Content-Type": "application/json",
            "Api-Key": PLANT_ID_API_KEY
        }
        payload = {
            "images": [image_data],
            "latitude": 0,
            "longitude": 0,
            "similar_images": True,
            "health": "all"
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=20)
        if response.status_code == 201:
            data = response.json()
            # Extract identification results
            result = data.get("result", {})
            classification = result.get("classification", {})
            suggestions = classification.get("suggestions", [])
            
            if not suggestions:
                return None
                
            best_match = suggestions[0]
            
            # Extract health results
            health = result.get("is_healthy", {})
            disease_info = result.get("disease", {})
            disease_suggestions = disease_info.get("suggestions", [])
            
            is_healthy = health.get("binary", True)
            disease_name = "Healthy"
            if not is_healthy and disease_suggestions:
                disease_name = disease_suggestions[0].get("name", "Unknown Disease")
                
            return {
                "plant_name": best_match.get("name", "Unknown Plant"),
                "disease_name": disease_name,
                "confidence": best_match.get("probability", 0.9),
                "details": {
                    "description": f"Overall health: {'Good' if is_healthy else 'Requires Attention'}.",
                    "prevention": "Ensure proper watering and sunlight.",
                    "treatment": "Consult a local nursery for plant-specific care."
                }
            }
    except Exception as e:
        print(f"Plant.id error: {e}")
    return None

def try_gemini_analysis(image_path):
    """Implementation for Gemini 1.5 Flash Vision."""
    try:
        img = Image.open(image_path)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = (
            "Analyze this plant photo. Return ONLY a JSON object: "
            "{\"plant_name\": \"...\", \"disease_name\": \"... or Healthy\", "
            "\"confidence\": 0.95, \"details\": {\"description\": \"...\", "
            "\"prevention\": \"...\", \"treatment\": \"...\"}}"
        )
        
        response = model.generate_content([prompt, img])
        res_text = response.text.strip()
        
        # Parse JSON from markdown or raw text
        if "```json" in res_text:
            res_text = res_text.split("```json")[1].split("```")[0].strip()
        elif "```" in res_text:
            res_text = res_text.split("```")[1].split("```")[0].strip()
            
        return json.loads(res_text)
    except Exception as e:
        if "leaked" in str(e).lower() or "403" in str(e):
            print("ERROR: GOOGLE_API_KEY is reported as leaked. Please update it in .env.")
        else:
            print(f"Gemini error: {e}")
    return None

def local_plant_analysis(image_path):
    """Primitive fallback logic if no external API is available."""
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize((100, 100))
        pixels = list(img.getdata())
        
        g_sum = sum(p[1] for p in pixels)
        total = sum(sum(p) for p in pixels)
        green_ratio = g_sum / total if total > 0 else 0
        
        if green_ratio > 0.4:
            return {
                "plant_name": "Healthy Plant",
                "disease_name": "Healthy",
                "confidence": 0.5,
                "details": {"description": "Looks green.", "prevention": "Continue care.", "treatment": "None."}
            }
        else:
            return {
                "plant_name": "Stressed Plant",
                "disease_name": "Requires Investigation",
                "confidence": 0.4,
                "details": {"description": "Low green levels.", "prevention": "Check lighting.", "treatment": "Take a better photo."}
            }
    except:
        return {"plant_name": "Unknown", "disease_name": "Error", "confidence": 0.0, "details": {}}

def stream_groq(query):
    """Use Gemini for chat assistant if available."""
    if not GOOGLE_API_KEY:
        yield "API key not configured."
        return

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(query, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        yield f"AI Assistant Error: {str(e)}"

def translate_text(text, target_language):
    """Use Gemini for translation."""
    if not GOOGLE_API_KEY or target_language == "en":
        return text

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Translate the following JSON data to {target_language}. Maintain the exact JSON structure and only translate the values: {text}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return text

def get_disease_info(plant_name, disease_name):
    """Retrieve detailed disease info via Gemini."""
    if not GOOGLE_API_KEY: return None
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Provide gardening details for {plant_name} with {disease_name}. Return in JSON format with description, prevention, and treatment."
        response = model.generate_content(prompt)
        return json.loads(response.text.strip())
    except:
        return None