import os
import requests
import json
import base64
import mimetypes
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
API_KEY = GROQ_API_KEY or GOOGLE_API_KEY
HF_API_KEY = os.getenv("HF_API_KEY")

def analyze_plant_disease(image_path):
    """Main Analysis Function - Try AI APIs, fallback to local analysis."""
    print(f"Starting Analysis for {image_path}...")
    
    # Try Google Gemini Vision API
    result = try_google_gemini_vision(image_path)
    if result and result.get("disease_name"):
        return result

    # Fallback to local simple analysis
    print("AI services failed. Using local fallback analysis...")
    result = local_fallback_analysis(image_path)
    if result:
        return result

    # Return error instead of mock data
    raise Exception("AI services unavailable. Please check GOOGLE_API_KEY in Render environment variables.")

def local_fallback_analysis(image_path):
    """Simple local analysis using basic image properties."""
    try:
        from PIL import Image
        import numpy as np
        
        img = Image.open(image_path)
        img = img.resize((100, 100))
        
        # Get average color
        avg_color = np.array(img).mean(axis=(0,1))
        r, g, b = avg_color[0], avg_color[1], avg_color[2]
        
        # Simple heuristic: brown/yellow colors may indicate disease
        if g < r * 1.2:  # Less green than red
            disease = "Possible Nutrient Deficiency"
            desc = "Plant appears yellowish. May indicate nitrogen deficiency or overwatering."
            treat = "Check soil moisture, consider adding nitrogen fertilizer."
            prev = "Ensure proper watering and fertilization."
        elif r > 200 and g > 200:  # Very bright
            disease = "Likely Healthy"
            desc = "Plant appears vibrant and well-lit."
            treat = "Continue current care routine."
            prev = "Maintain regular watering and sunlight."
        else:
            disease = "Analysis Inconclusive"
            desc = "Unable to determine plant health. Please try with clearer image."
            treat = "Take photo in good lighting."
            prev = "Ensure good lighting when capturing."
            
        return {
            "plant_name": "Detected Plant",
            "disease_name": disease,
            "confidence": 0.5,
            "details": {
                "description": desc,
                "prevention": prev,
                "treatment": treat
            }
        }
    except Exception as e:
        print(f"Local fallback failed: {e}")
        return None

def get_mock_result():
    raise Exception("AI service unavailable. Please configure GROQ_API_KEY in environment variables.")

def try_google_gemini_vision(image_path):
    """Use Google Gemini Vision API for fast plant analysis."""
    google_key = os.getenv("GOOGLE_API_KEY")
    if not google_key:
        print("No Google API key")
        return None
    
    try:
        import mimetypes
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/jpeg"
        
        # Use Google Gemini Pro Vision API
        api_url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={google_key}"
        
        prompt = """Analyze this plant image and return ONLY valid JSON with these exact keys:
{
  "plant_name": "name of the plant",
  "disease_name": "name of disease or Healthy",
  "confidence": 0.0-1.0,
  "details": {
    "description": "brief description",
    "prevention": "prevention tips",
    "treatment": "treatment suggestions"
  }
}"""
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": image_data}}
                ]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 1024,
                "responseSchema": {
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
                    },
                    "required": ["plant_name", "disease_name", "confidence", "details"]
                }
            }
        }
        
        response = requests.post(api_url, json=payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            text = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            print(f"Gemini Result: {text[:200]}...")
            
            # Extract JSON from response
            try:
                # Try to parse as JSON directly
                return json.loads(text)
            except:
                # Try to extract JSON from markdown code block
                import re
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    return json.loads(match.group())
                    
        print(f"Gemini API Error: {response.status_code} - {response.text}")
        return None
        
    except Exception as e:
        print(f"Gemini Exception: {e}")
        return None

def try_groq_vision(image_path):
    """Use Groq with vision-enabled model for plant analysis."""
    if not API_KEY:
        print("No API key configured")
        return None
    
    try:
        from groq import Groq
        
        client = Groq(api_key=API_KEY)
        
        # Read and encode image
        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        mime_type, _ = mimetypes.guess_type(image_path)
        if not mime_type:
            mime_type = "image/jpeg"
        
        prompt = """Analyze this plant image and return JSON with these exact keys:
- plant_name: name of the plant
- disease_name: name of disease or "Healthy" 
- confidence: confidence score (0-1)
- details: object with description, prevention, treatment

Return ONLY valid JSON, no extra text."""

        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{image_data}"}
                        }
                    ]
                }
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        print(f"Groq Vision Result: {result[:200]}...")
        return json.loads(result)
        
    except ImportError:
        print("Groq not installed. Installing...")
        return None
    except Exception as e:
        print(f"Groq Exception: {e}")
        return None

def try_hugging_face(image_path):
    API_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large"
    
    headers = {}
    if HF_API_KEY:
        headers["Authorization"] = f"Bearer {HF_API_KEY}"
    
    try:
        with open(image_path, "rb") as f:
            data = f.read()
        
        response = requests.post(API_URL, headers=headers, data=data, timeout=20)
        
        if response.status_code == 200:
            description = response.json()[0].get("generated_text", "Plant detected")
            print(f"HuggingFace Success: {description}")
            
            return {
                "plant_name": "Plant Detected (Backup AI)",
                "disease_name": "Visual Analysis Complete",
                "confidence": 0.85,
                "details": {
                    "description": f"AI Analysis: {description}",
                    "prevention": "Ensure proper watering and sunlight.",
                    "treatment": "Consult a local agriculturist."
                }
            }
    except Exception as e:
        print(f"HuggingFace Exception: {e}")

    return None

def get_mock_result():
    return {
        "plant_name": "Server Unavailable",
        "disease_name": "Check Connection",
        "confidence": 0.0,
        "details": {
            "description": "We could not connect to any AI service.",
            "prevention": "Try again later.",
            "treatment": "Restart App."
        }
    }

def ask_groq(query):
    """Chat using Groq LLM."""
    if not API_KEY:
        return "AI Service Unavailable (No API Key)"
    
    try:
        from groq import Groq
        client = Groq(api_key=API_KEY)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are Plant Guardian, a helpful plant care assistant. Keep answers short and helpful."},
                {"role": "user", "content": query}
            ],
            max_tokens=150,
            temperature=0.5
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq Chat Error: {e}")
        return "I am unable to connect to the AI right now."

def stream_groq(query):
    """Streaming chat using Groq."""
    if not API_KEY:
        yield "AI Service Unavailable (No API Key)"
        return
    
    try:
        from groq import Groq
        client = Groq(api_key=API_KEY)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are Plant Guardian, a helpful plant care assistant. Keep answers short and helpful."},
                {"role": "user", "content": query}
            ],
            max_tokens=500,
            temperature=0.5,
            stream=True
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        print(f"Groq Streaming Error: {e}")
        yield "I'm having trouble processing that right now."

def translate_text(text, target_language):
    if not API_KEY:
        return text
    
    try:
        from groq import Groq
        client = Groq(api_key=API_KEY)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": f"Translate the following JSON to {target_language}. Return ONLY the translated JSON with same keys."},
                {"role": "user", "content": text}
            ],
            max_tokens=1024,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Translation Error: {e}")
        return text

def get_disease_info(plant_name, disease_name):
    if not API_KEY:
        return None
    
    try:
        from groq import Groq
        client = Groq(api_key=API_KEY)
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Return JSON with keys: description, prevention, treatment"},
                {"role": "user", "content": f"Tell me about {disease_name} in {plant_name}"}
            ],
            max_tokens=300,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Get Disease Info Error: {e}")
        return None

# Legacy function names for backward compatibility
try_google_gemini = try_groq_vision
ask_gemini = ask_groq
stream_gemini = stream_groq