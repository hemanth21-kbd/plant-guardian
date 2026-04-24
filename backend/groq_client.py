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
    """Implementation for Gemini 1.5/2.5 Flash Vision."""
    try:
        uploaded_file = genai.upload_file(image_path)
        
        prompt = """
You are an expert botanist and plant pathologist. Carefully analyze the provided plant photo.
1. Accurately identify the plant species.
2. Identify any visible diseases, pests, fungal infections, or nutrient deficiencies accurately. 
3. If the plant is perfectly healthy, set disease_name to "Healthy".
4. Provide practical, high-value advice for treatments.
You MUST respond with valid JSON only, in EXACTLY the following structure:
{
  "plant_name": "Name of the plant",
  "disease_name": "Specific disease/pest name (or 'Healthy')",
  "confidence": 0.95,
  "details": {
    "severity": "High/Medium/Low/None",
    "symptoms": "Detailed description of what is visibly affecting the plant",
    "treatments": [
      {
        "type": "Organic/Chemical/General",
        "description": "Specific treatment steps and recommendations",
        "cost_approx": "$10"
      }
    ],
    "prevention": "How to prevent this in the future",
    "fertilizers": [
      {
        "name": "NPK 10-10-10 or specific product",
        "description": "Why this fertilizer helps",
        "when": "Frequency"
      }
    ]
  }
}
"""
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        try:
            response = model.generate_content(
                [prompt, uploaded_file],
                generation_config={"response_mime_type": "application/json"}
            )
        except Exception as e:
            print(f"Fallback to gemini-2.0-flash because: {e}")
            model = genai.GenerativeModel('gemini-2.0-flash')
            response = model.generate_content(
                [prompt, uploaded_file],
                generation_config={"response_mime_type": "application/json"}
            )
            
        res_text = response.text.strip()
        
        if not res_text:
            print("Gemini returned empty response")
            return None
        
        # Parse JSON from markdown or raw text just in case the model ignores mime type
        if "```json" in res_text:
            res_text = res_text.split("```json")[1].split("```")[0].strip()
        elif "```" in res_text:
            res_text = res_text.split("```")[1].split("```")[0].strip()
        
        # Try to extract JSON from response
        try:
            result = json.loads(res_text)
            
            # Transform response to match frontend format
            if result and 'details' in result:
                details = result['details']
                
                # Convert treatment to treatments array if missing
                if 'treatment' in details and 'treatments' not in details:
                    treatment = details.pop('treatment')
                    if treatment:
                        details['treatments'] = [
                            {"type": "General", "description": treatment, "cost_approx": "Varies"}
                        ]
                
                # Ensure required fields exist
                if 'severity' not in details:
                    details['severity'] = "Medium"
                if 'symptoms' not in details:
                    details['symptoms'] = details.get('description', 'No symptoms recorded')
                    
            return result
        except json.JSONDecodeError:
            import re
            match = re.search(r'\{.*\}', res_text, re.DOTALL)
            if match:
                return json.loads(match.group())
            print(f"Failed to parse response: {res_text[:200]}")
            return None
    except Exception as e:
        error_msg = str(e)
        if "leaked" in error_msg.lower() or "403" in error_msg:
            print("ERROR: GOOGLE_API_KEY is reported as leaked. Please update it in .env.")
        else:
            print(f"Gemini error: {error_msg}")
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
        model = genai.GenerativeModel('gemini-2.0-flash')
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
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"Translate the following JSON data to {target_language}. Maintain the exact JSON structure and only translate the values: {text}"
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return text

def get_disease_info(plant_name, disease_name):
    """Retrieve detailed disease info via Gemini."""
    if not GOOGLE_API_KEY: return None
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        prompt = f"Provide gardening details for {plant_name} with {disease_name}. Return in JSON format with description, prevention, and treatment."
        response = model.generate_content(prompt)
        return json.loads(response.text.strip())
    except:
        return None