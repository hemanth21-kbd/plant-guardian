import requests
import time

CITIES = {
    "Delhi": (28.6139, 77.2090),
    "Mumbai": (19.0760, 72.8777)
}

TAGS = [
    "shop=agrarian",
    "shop=agro", 
    "shop=agricultural",
    "shop=garden_centre",
    "shop=hardware",
    "shop=farm",
    "amenity=marketplace"
]

def query_osm(lat, lon, radius, tag):
    overpass_url = "https://overpass-api.de/api/interpreter"
    key, value = tag.split('=')
    query = f'[out:json][timeout:10];node["{key}={value}"]({lat},{lon},{radius});out;'
    try:
        response = requests.get(overpass_url, params={"data": query}, timeout=15)
        if response.status_code == 200:
            data = response.json()
            return len(data.get("elements", []))
        return 0
    except Exception as e:
        print(f"  Error: {e}")
        return -1

print("Testing OpenStreetMap tags in Indian cities (10km radius)")
print("=" * 60)
print(f"{'City':<12} {'Tag':<25} {'Results':<10}")
print("-" * 60)

for city in ["Delhi", "Mumbai"]:
    lat, lon = CITIES[city]
    print(f"\n{city}:")
    for tag in TAGS:
        result = query_osm(lat, lon, 10000, tag)
        while result == -1:
            time.sleep(2)
            result = query_osm(lat, lon, 10000, tag)
        print(f"  {tag:<25} {result}")
        time.sleep(1)

print("\n" + "=" * 60)
print("Working tags (results > 0):")
print("-" * 60)