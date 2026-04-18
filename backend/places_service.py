import os
import requests
import json
import time
from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any

router = APIRouter()

# Try to import groq for AI-powered features
try:
    from groq import Groq
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
except:
    groq_client = None

# Multiple Overpass API endpoints for redundancy
OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.firefox.otange.link/api/interpreter",
]

def query_overpass(query: str, timeout: int = 30) -> Optional[dict]:
    """Try multiple Overpass API endpoints with retries."""
    for endpoint in OVERPASS_ENDPOINTS:
        try:
            response = requests.post(
                endpoint,
                data=query,
                headers={"Content-Type": "text/plain"},
                timeout=timeout
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            print(f"Overpass error on {endpoint}: {e}")
            time.sleep(1)  # Brief delay before next endpoint
    return None

@router.get("/nearby-shops")
def get_nearby_shops(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(30000, description="Search radius in meters")
):
    """
    Find nearby fertilizer/agriculture shops using OpenStreetMap.
    Uses broad Indian-relevant tags: hardware, convenience, general stores + agricultural keywords.
    """
    # Broader query: hardware + convenience + general + supermarket with name filtering
    overpass_query = f"""
    [out:json][timeout:30];
    (
      node["shop"~"hardware|convenience|general|supermarket|agro|agricultural|farm|garden"](around:{radius},{lat},{lon});
      way["shop"~"hardware|convenience|general|supermarket|agro|agricultural|farm|garden"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        data = query_overpass(overpass_query, timeout=30)
        if not data:
            return {"error": "Overpass API unavailable", "shops": [], "count": 0}
        
        shops = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "Local Shop")
            
            # Filter: keep shops with agriculture-related keywords in name
            name_lower = name.lower()
            agri_keywords = ['agri', 'farm', 'fertilizer', 'pesticide', 'seed', 'kisan', 'krishi', 
                           'hardware', 'tool', 'equipment', 'horticulture', 'garden', 'nursery']
            
            # Also keep if shop type explicitly agricultural
            shop_type = tags.get("shop", "")
            is_agri_shop = any(kw in name_lower for kw in agri_keywords) or shop_type in ['agrarian', 'agro', 'farm_supply', 'garden_centre']
            
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val and is_agri_shop:
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
                    "address": tags.get("addr:street", tags.get("addr:full", "Nearby")),
                    "type": shop_type,
                })
        
        shops = sorted(shops, key=lambda x: float(x["distance"].replace(" km", "")))[:15]
        
        return {"shops": shops, "count": len(shops)}
        
    except Exception as e:
        print(f"OSM Shops Error: {e}")
        return {"error": str(e), "shops": [], "count": 0}

@router.get("/nearby-markets")
def get_nearby_markets(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(30000, description="Search radius in meters")
):
    """
    Find nearby markets using OpenStreetMap.
    Searches for marketplaces, retail areas, supermarkets, and commercial zones.
    """
    # Broader query: marketplace + retail + supermarket + commercial + shopping centers
    overpass_query = f"""
    [out:json][timeout:30];
    (
      node["amenity"~"marketplace|trading|fair"](around:{radius},{lat},{lon});
      way["amenity"~"marketplace|trading|fair"](around:{radius},{lat},{lon});
      node["landuse"~"retail|commercial"](around:{radius},{lat},{lon});
      way["landuse"~"retail|commercial"](around:{radius},{lat},{lon});
      node["shop"~"supermarket|mall|department_store"](around:{radius},{lat},{lon});
      way["shop"~"supermarket|mall|department_store"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        data = query_overpass(overpass_query, timeout=30)
        if not data:
            return {"error": "Overpass API unavailable", "markets": [], "count": 0}
        
        markets = []
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "Local Market")
            
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                import math
                R = 6371
                dlat = math.radians(lat_val - lat)
                dlon = math.radians(lon_val - lon)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(lat_val)) * math.sin(dlon/2)**2
                distance = round(R * 2 * math.asin(math.sqrt(a)), 1)
                
                # Determine market type
                market_type = tags.get("amenity", tags.get("landuse", tags.get("shop", "Market")))
                
                markets.append({
                    "id": element.get("id"),
                    "name": name,
                    "distance": f"{distance} km",
                    "lat": lat_val,
                    "lon": lon_val,
                    "type": market_type.replace("_", " ").title(),
                })
        
        markets = sorted(markets, key=lambda x: float(x["distance"].replace(" km", "")))[:15]
        
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