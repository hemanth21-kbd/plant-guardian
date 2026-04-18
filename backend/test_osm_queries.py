#!/usr/bin/env python3
"""
Test script for OpenStreetMap Overpass queries for Indian locations.
Tests shop and market queries for Delhi and Mumbai coordinates.
"""
import requests
import json

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

def query_overpass(query: str, timeout: int = 30) -> dict:
    """Query Overpass API with fallback endpoints."""
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
    return {}

def test_delhi_shop_query():
    """Test NEW shop query with Delhi coordinates."""
    print("\n" + "="*60)
    print("TEST 1: Delhi Shop Query (28.6139, 77.2090, 30km radius)")
    print("="*60)
    
    delhi_lat, delhi_lon = 28.6139, 77.2090
    radius = 30000
    
    overpass_query = f"""
    [out:json][timeout:30];
    (
      node["shop"~"hardware|convenience|general|supermarket|agro|agricultural|farm|garden"](around:{radius},{delhi_lat},{delhi_lon});
      way["shop"~"hardware|convenience|general|supermarket|agro|agricultural|farm|garden"](around:{radius},{delhi_lat},{delhi_lon});
    );
    out center;
    """
    
    data = query_overpass(overpass_query)
    elements = data.get("elements", [])
    raw_count = len(elements)
    
    print(f"\nRaw Overpass results: {raw_count} elements")
    
    agri_keywords = ['agri', 'farm', 'fertilizer', 'pesticide', 'seed', 'kisan', 'krishi', 
                  'hardware', 'tool', 'equipment', 'horticulture', 'garden', 'nursery']
    
    filtered_shops = []
    for element in elements:
        tags = element.get("tags", {})
        name = tags.get("name", "Local Shop")
        shop_type = tags.get("shop", "")
        name_lower = name.lower()
        
        is_agri = any(kw in name_lower for kw in agri_keywords) or shop_type in ['agro', 'agricultural', 'farm_supply', 'garden_centre']
        
        if is_agri:
            lat_val = element.get("lat") or element.get("center", {}).get("lat")
            lon_val = element.get("lon") or element.get("center", {}).get("lon")
            if lat_val and lon_val:
                filtered_shops.append({
                    "name": name,
                    "type": shop_type or "general"
                })
    
    filtered_count = len(filtered_shops)
    print(f"Filtered (agri keyword match): {filtered_count} shops")
    
    print(f"\nFirst {min(3, len(filtered_shops))} shop names with types:")
    for i, shop in enumerate(filtered_shops[:3], 1):
        print(f"  {i}. {shop['name']} (type: {shop['type']})")
    
    return raw_count, filtered_count

def test_mumbai_market_query():
    """Test NEW market query with Mumbai coordinates."""
    print("\n" + "="*60)
    print("TEST 2: Mumbai Market Query (19.0760, 72.8777, 30km radius)")
    print("="*60)
    
    mumbai_lat, mumbai_lon = 19.0760, 72.8777
    radius = 30000
    
    overpass_query = f"""
    [out:json][timeout:30];
    (
      node["amenity"~"marketplace|trading|fair"](around:{radius},{mumbai_lat},{mumbai_lon});
      node["landuse"~"retail|commercial"](around:{radius},{mumbai_lat},{mumbai_lon});
      node["shop"~"supermarket|mall|department_store"](around:{radius},{mumbai_lat},{mumbai_lon});
    );
    out center;
    """
    
    data = query_overpass(overpass_query)
    elements = data.get("elements", [])
    count = len(elements)
    
    print(f"\nTotal results: {count} elements")
    
    markets = []
    for element in elements:
        tags = element.get("tags", {})
        name = tags.get("name", "Local Market")
        market_type = tags.get("amenity", tags.get("landuse", tags.get("shop", "market")))
        
        lat_val = element.get("lat") or element.get("center", {}).get("lat")
        lon_val = element.get("lon") or element.get("center", {}).get("lon")
        
        if lat_val and lon_val:
            markets.append({
                "name": name,
                "type": market_type
            })
    
    print(f"\nFirst {min(3, len(markets))} market names and types:")
    for i, market in enumerate(markets[:3], 1):
        print(f"  {i}. {market['name']} (type: {market['type']})")
    
    return count

def test_live_backend():
    """Test the live backend endpoint."""
    print("\n" + "="*60)
    print("TEST 3: Live Backend Endpoint")
    print("="*60)
    
    url = "https://plant-guardian-backend.onrender.com/places/nearby-shops"
    params = {"lat": 19.0760, "lon": 72.8777, "radius": 30000}
    
    print(f"\nGET {url}")
    print(f"Params: {params}")
    
    try:
        response = requests.get(url, params=params, timeout=30)
        http_status = response.status_code
        print(f"HTTP Status: {http_status}")
        
        if http_status == 200:
            data = response.json()
            shops_count = data.get("count", 0)
            print(f"Shops count in response: {shops_count}")
            
            if shops_count > 0:
                print(f"\nFirst 3 shops from backend:")
                for i, shop in enumerate(data.get("shops", [])[:3], 1):
                    print(f"  {i}. {shop.get('name')} (type: {shop.get('type')}, dist: {shop.get('distance')})")
        else:
            print(f"Error: {response.text}")
            shops_count = 0
        
        return http_status, shops_count
        
    except Exception as e:
        print(f"Request error: {e}")
        return 0, 0

def main():
    print("="*60)
    print("OpenStreetMap Overpass Query Tests for Indian Locations")
    print("="*60)
    
    delhi_raw, delhi_filtered = test_delhi_shop_query()
    mumbai_count = test_mumbai_market_query()
    http_status, backend_shops = test_live_backend()
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Delhi shop query - Raw results: {delhi_raw}, Filtered: {delhi_filtered}")
    print(f"Mumbai market query - Total results: {mumbai_count}")
    print(f"Live backend - HTTP {http_status}, shops: {backend_shops}")
    
    success = delhi_raw > 0 or delhi_filtered > 0
    print(f"\nOverall: {'PASS - Queries return results' if success else 'FAIL - No results returned'}")

if __name__ == "__main__":
    main()