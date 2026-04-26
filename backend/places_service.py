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
            time.sleep(1)
    return None

def is_agricultural_shop(tags: dict, name: str) -> bool:
    """
    Strict filter for genuine agricultural input shops.
    Only includes shops that are explicitly tagged as agricultural
    or have clear agricultural keywords in their name.
    """
    shop_type = tags.get("shop", "").lower()
    name_lower = name.lower()
    
    # Primary agricultural shop types (OSM official tags)
    primary_agri_tags = {
        'agrarian', 'agro', 'farm_supply', 'garden_centre', 'farm',
        'agricultural', 'horticulture', 'nursery'
    }
    
    if shop_type in primary_agri_tags:
        return True
    
    # Secondary: hardware shops that explicitly mention agriculture
    if shop_type == 'hardware':
        agri_hardware_keywords = [
            'agri', 'farm', 'agriculture', 'kisan', 'krishi',
            'fertilizer', 'pesticide', 'seed', 'irrigation',
            'tractor', 'farm equipment', 'agricultural implements'
        ]
        return any(kw in name_lower for kw in agri_hardware_keywords)
    
    # Shop type is not agricultural at all - reject
    non_agri_tags = {
        'convenience', 'supermarket', 'mall', 'department_store',
        'general', 'retail', 'commercial', 'trading', 'wholesale',
        'clothes', 'electronics', 'furniture', 'car', 'repair',
        'bakery', 'butcher', 'chemist', 'pharmacy', 'restaurant',
        'cafe', 'bar', 'bank', 'atm', 'fuel', 'car_repair'
    }
    
    if shop_type in non_agri_tags:
        return False
    
    # For any other shop type, require very strong agri indication in name
    strong_agri_keywords = [
        'agri', 'farm', 'agriculture', 'kisan', 'krishi',
        'fertilizer', 'pesticide', 'seed', 'irrigation', 'agrochemical',
        'farm inputs', 'agri inputs', 'horticulture', 'nursery'
    ]
    
    return any(kw in name_lower for kw in strong_agri_keywords)

@router.get("/nearby-shops")
def get_nearby_shops(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(150000, description="Search radius in meters")
):
    """
    Find nearby fertilizer/agriculture shops using OpenStreetMap.
    Only returns genuine agricultural input suppliers.
    """
    overpass_query = f"""
    [out:json][timeout:60];
    (
      node["shop"~"agrarian|agro|farm_supply|garden_centre|farm|agricultural|horticulture|nursery"](around:{radius},{lat},{lon});
      way["shop"~"agrarian|agro|farm_supply|garden_centre|farm|agricultural|horticulture|nursery"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        data = query_overpass(overpass_query, timeout=60)
        if not data:
            return {"error": "Overpass API unavailable", "shops": [], "count": 0}
        
        shops = []
        seen_coords = set()  # Deduplicate by approximate location
        
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "Local Agri Shop")
            
            # Skip if no proper name
            if len(name.strip()) < 2 or name.lower() in ['shop', 'store', 'business']:
                continue
            
            # Strict agricultural filter
            if not is_agricultural_shop(tags, name):
                continue
            
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                # Round coordinates to avoid near-duplicate entries
                coord_key = (round(lat_val, 5), round(lon_val, 5))
                if coord_key in seen_coords:
                    continue
                seen_coords.add(coord_key)
                
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
                    "type": tags.get("shop", "").replace("_", " ").title(),
                })
        
        # Sort by distance and limit to 50
        shops = sorted(shops, key=lambda x: float(x["distance"].replace(" km", "")))[:50]
        
        print(f"Found {len(shops)} agricultural shops after filtering")
        for shop in shops[:5]:
            print(f"  - {shop['name']} ({shop['type']}) - {shop['distance']}km")
        
        return {"shops": shops, "count": len(shops)}
        
    except Exception as e:
        print(f"OSM Shops Error: {e}")
        return {"error": str(e), "shops": [], "count": 0}

@router.get("/nearby-markets")
def get_nearby_markets(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(150000, description="Search radius in meters")
):
    """
    Find nearby markets using OpenStreetMap.
    Returns actual marketplaces and trading areas.
    """
    overpass_query = f"""
    [out:json][timeout:60];
    (
      node["amenity"~"marketplace|trading|fair|bazaar|market"](around:{radius},{lat},{lon});
      way["amenity"~"marketplace|trading|fair|bazaar|market"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        data = query_overpass(overpass_query, timeout=60)
        if not data:
            return {"error": "Overpass API unavailable", "markets": [], "count": 0}
        
        markets = []
        seen_coords = set()
        
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", "Local Market")
            
            # Skip unnamed or generic entries
            if len(name.strip()) < 2:
                continue
            
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                coord_key = (round(lat_val, 5), round(lon_val, 5))
                if coord_key in seen_coords:
                    continue
                seen_coords.add(coord_key)
                
                import math
                R = 6371
                dlat = math.radians(lat_val - lat)
                dlon = math.radians(lon_val - lon)
                a = math.sin(dlat/2)**2 + math.cos(math.radians(lat)) * math.cos(math.radians(lat_val)) * math.sin(dlon/2)**2
                distance = round(R * 2 * math.asin(math.sqrt(a)), 1)
                
                # Determine market type
                market_type = (
                    tags.get("amenity", "") or 
                    tags.get("landuse", "") or 
                    tags.get("shop", "") or 
                    "Market"
                )
                
                markets.append({
                    "id": element.get("id"),
                    "name": name,
                    "distance": f"{distance} km",
                    "lat": lat_val,
                    "lon": lon_val,
                    "type": market_type.replace("_", " ").title(),
                })
        
        markets = sorted(markets, key=lambda x: float(x["distance"].replace(" km", "")))[:50]
        
        print(f"Found {len(markets)} markets")
        for market in markets[:3]:
            print(f"  - {market['name']} ({market['type']}) - {market['distance']}km")
        
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