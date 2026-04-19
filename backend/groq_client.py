import os
import numpy as np
from PIL import Image

def analyze_plant_disease(image_path):
    """Main Analysis Function - Local image analysis for plant disease."""
    print(f"Starting Local Analysis for {image_path}...")
    return local_plant_analysis(image_path)

def local_plant_analysis(image_path):
    """Analyze plant health using image color analysis."""
    try:
        img = Image.open(image_path).convert('RGB')
        img = img.resize((150, 150))
        pixels = np.array(img)
        
        # Calculate color statistics
        r_mean = pixels[:,:,0].mean()
        g_mean = pixels[:,:,1].mean()
        b_mean = pixels[:,:,2].mean()
        
        # Calculate green ratio
        total = r_mean + g_mean + b_mean
        green_ratio = g_mean / total if total > 0 else 0
        
        # Calculate yellowness (high R+G, low B)
        yellowness = (r_mean + g_mean) / (2 * b_mean) if b_mean > 0 else 1
        
        # Calculate brown spots (high R, medium G, low B)
        brown_mask = (pixels[:,:,0] > 120) & (pixels[:,:,1] > 80) & (pixels[:,:,1] < 150) & (pixels[:,:,2] < 100)
        brown_ratio = brown_mask.sum() / pixels[:,:,0].size
        
        print(f"Green ratio: {green_ratio:.2f}, Yellowness: {yellowness:.2f}, Brown spots: {brown_ratio:.2f}")
        
        # Determine disease based on color analysis
        if green_ratio > 0.42 and brown_ratio < 0.1:
            return {
                "plant_name": "Healthy Plant",
                "disease_name": "Healthy",
                "confidence": 0.85,
                "details": {
                    "description": "Plant appears healthy with good green coloration.",
                    "prevention": "Continue current watering and sunlight routine.",
                    "treatment": "No treatment needed. Maintain current care."
                }
            }
        elif brown_ratio > 0.2:
            return {
                "plant_name": "Affected Plant",
                "disease_name": "Possibly Fungal Infection",
                "confidence": 0.7,
                "details": {
                    "description": "Brown spots detected. May indicate fungal disease or rotting.",
                    "prevention": "Improve air circulation, reduce watering.",
                    "treatment": "Apply fungicide. Remove affected leaves."
                }
            }
        elif yellowness > 1.5:
            return {
                "plant_name": "Yellowing Plant",
                "disease_name": "Nitrogen Deficiency",
                "confidence": 0.75,
                "details": {
                    "description": "Plant appears yellow. Likely nitrogen deficiency.",
                    "prevention": "Apply nitrogen-rich fertilizer.",
                    "treatment": "Give urea or compost fertilizer."
                }
            }
        elif green_ratio < 0.35:
            return {
                "plant_name": "Stressed Plant",
                "disease_name": "Environmental Stress",
                "confidence": 0.6,
                "details": {
                    "description": "Plant shows signs of stress.",
                    "prevention": "Ensure proper watering and light.",
                    "treatment": "Check soil moisture and light conditions."
                }
            }
        else:
            return {
                "plant_name": "Monitor Plant",
                "disease_name": "Needs Monitoring",
                "confidence": 0.5,
                "details": {
                    "description": "Unable to determine. Please consult expert.",
                    "prevention": "Regular monitoring recommended.",
                    "treatment": "Take another photo in better lighting."
                }
            }
            
    except Exception as e:
        print(f"Analysis error: {e}")
        return {
            "plant_name": "Analysis Error",
            "disease_name": "Unable to Analyze",
            "confidence": 0.0,
            "details": {
                "description": f"Error: {str(e)}",
                "prevention": "Try again with clearer image.",
                "treatment": "Restart analysis."
            }
        }

def ask_groq(query):
    return "Chat disabled. Use disease scanner for diagnosis."

def stream_groq(query):
    yield "Chat disabled."

def translate_text(text, target_language):
    return text

def get_disease_info(plant_name, disease_name):
    return None