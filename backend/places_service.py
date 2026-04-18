import os
import requests
import json
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

# Try to import groq for AI-powered features
try:
    from groq import Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except:
    groq_client = None

@router.get("/nearby-shops")
def get_nearby_shops(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(30000, description="Search radius in meters")
):
    """
    Find nearby fertilizer/agriculture shops using OpenStreetMap.
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["shop"="agrarian"](around:{radius},{lat},{lon});
      node["shop"="farm_supply"](around:{radius},{lat},{lon});
      node["shop"="agro"](around:{radius},{lat},{lon});
      node["shop"="garden_centre"](around:{radius},{lat},{lon});
      way["shop"="farm_supply"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        headers = {"Content-Type": "text/plain"}
        response = requests.post(overpass_url, data=overpass_query, headers=headers, timeout=30)
        print(f"OSM Shops Response: {response.status_code}")
        data = response.json()
        
        shops = []
        for element in data.get("elements", []):
            name = element.get("tags", {}).get("name", "Local Agri Shop")
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                import math
                R = 6371
                dlat = math.radians(lat_val - lat)
                dlon = math.radians(lon_val - lon)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(lat_val)) * math.sin(dlon/2)**2
                distance = round(R * 2 * math.asin(math.sqrt(a)), 1)
                
                shops.append({
                    "id": element.get("id"),
                    "name": name,
                    "distance": f"{distance} km",
                    "lat": lat_val,
                    "lon": lon_val,
                    "address": element.get("tags", {}).get("addr:street", "Nearby"),
                })
        
        shops = sorted(shops, key=lambda x: float(x["distance"].replace(" km", "")))[:10]
        
        # Use Groq to enhance shop data with descriptions
        if groq_client and shops:
            try:
                shop_names = ", ".join([s["name"] for s in shops[:5]])
                response = groq_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": "You are a local guide. Provide brief descriptions (max 5 words each) for these shops if they sell agricultural products. Return JSON array of descriptions."},
                        {"role": "user", "content": f"Shops: {shop_names}"}
                    ],
                    max_tokens=100
                )
                # Parse and add descriptions if available
            except:
                pass
                
        return {"shops": shops, "count": len(shops)}
        
    except Exception as e:
        print(f"OSM Error: {e}")
        return {"error": str(e), "shops": [], "count": 0}

@router.get("/nearby-markets")
def get_nearby_markets(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(10000, description="Search radius in meters")
):
    """
    Find nearby markets using OpenStreetMap.
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["land_use"="retail"](around:{radius},{lat},{lon});
      way["land_use"="retail"](around:{radius},{lat},{lon});
      node["amenity"="marketplace"](around:{radius},{lat},{lon});
      way["amenity"="marketplace"](around:{radius},{lat},{lon});
      node["shop"="mall"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        headers = {"Content-Type": "text/plain"}
        response = requests.post(overpass_url, data=overpass_query, headers=headers, timeout=30)
        print(f"OSM Markets Response: {response.status_code}")
        data = response.json()
        
        markets = []
        for element in data.get("elements", []):
            name = element.get("tags", {}).get("name", "Local Market")
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                import math
                R = 6371
                dlat = math.radians(lat_val - lat)
                dlon = math.radians(lon_val - lon)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(lat_val)) * math.sin(dlon/2)**2
                distance = round(R * 2 * math.asin(math.sqrt(a)), 1)
                
                markets.append({
                    "id": element.get("id"),
                    "name": name,
                    "distance": f"{distance} km",
                    "lat": lat_val,
                    "lon": lon_val,
                    "type": element.get("tags", {}).get("land_use", "Market"),
                })
        
        markets = sorted(markets, key=lambda x: float(x["distance"].replace(" km", "")))[:10]
        
        return {"markets": markets, "count": len(markets)}
        
    except Exception as e:
        print(f"OSM Markets Error: {e}")
        return {"error": str(e), "markets": [], "count": 0}

@router.get("/live-price")
def get_live_price(comparison: str = Query(..., description="Crop/commodity name")):
    """
    Get live price using Groq AI to search current market rates.
    """
    if not groq_client:
        return {"error": "GROQ_API_KEY not configured", "price": None, "source": "AI"}
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an agricultural market expert. Provide current price information for crops/commodities in Indian markets. Return ONLY JSON with keys: commodity, price (in INR), unit (kg/dozen/quintal), market, trend (up/down/stable). If unsure, return price as 'varies'."},
                {"role": "user", "content": f"What is the current price of {comparison} in Indian markets today?"}
            ],
            max_tokens=150,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {
            "commodity": comparison,
            "price_data": result,
            "source": "AI (Groq)"
        }
    except Exception as e:
        return {"error": str(e), "commodity": comparison, "source": "AI"}

@router.get("/fertilizer-price")
def get_fertilizer_price(fertilizer: str = Query(..., description="Fertilizer name")):
    """
    Get fertilizer prices using Groq AI.
    """
    if not groq_client:
        return {"error": "GROQ_API_KEY not configured", "price": None}
    
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an agricultural input expert. Provide current prices of fertilizers in India. Return ONLY JSON with keys: name, price (in INR per 50kg bag), brand, trend."},
                {"role": "user", "content": f"What is the current price of {fertilizer} fertilizer in India?"}
            ],
            max_tokens=100,
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"fertilizer": fertilizer, "price_data": result, "source": "AI (Groq)"}
    except Exception as e:
        return {"error": str(e)}