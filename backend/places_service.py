import requests
from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

@router.get("/nearby-shops")
def get_nearby_shops(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(5000, description="Search radius in meters")
):
    """
    Find nearby fertilizer/agriculture shops using OpenStreetMap Overpass API (free).
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Query for agriculture shops, fertilizer shops, seed shops within radius
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["shop"="agrarian"](around:{radius},{lat},{lon});
      node["shop"="farm_supply"](around:{radius},{lat},{lon});
      node["shop"="agro"](around:{radius},{lat},{lon});
      way["shop"="agrarian"](around:{radius},{lat},{lon});
      way["shop"="farm_supply"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        response = requests.post(overpass_url, data=overpass_query, timeout=30)
        data = response.json()
        
        shops = []
        for element in data.get("elements", []):
            name = element.get("tags", {}).get("name", "Local Agri Shop")
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            
            if lat_val and lon_val:
                # Calculate distance
                import math
                R = 6371  # Earth's radius in km
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
        
        # Sort by distance and return top 10
        shops = sorted(shops, key=lambda x: float(x["distance"].replace(" km", "")))[:10]
        return {"shops": shops, "count": len(shops)}
        
    except Exception as e:
        return {"error": str(e), "shops": [], "count": 0}

@router.get("/nearby-markets")
def get_nearby_markets(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(10000, description="Search radius in meters")
):
    """
    Find nearby markets (APMC, wholesale markets) using OpenStreetMap Overpass API.
    """
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Query for markets, wholesale, commercial areas
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["land_use"="retail"](around:{radius},{lat},{lon});
      way["land_use"="retail"](around:{radius},{lat},{lon});
      node["amenity"="marketplace"](around:{radius},{lat},{lon});
      way["amenity"="marketplace"](around:{radius},{lat},{lon});
    );
    out center;
    """
    
    try:
        response = requests.post(overpass_url, data=overpass_query, timeout=30)
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
        return {"error": str(e), "markets": [], "count": 0}