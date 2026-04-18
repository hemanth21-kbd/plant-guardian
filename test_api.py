import requests
import time

CITIES = {
    "Delhi": (28.6139, 77.2090),
    "Mumbai": (19.0760, 72.8777)
}

def test_tag(lat, lon, tag, radius=10000):
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f'[out:json][timeout:15];node["{tag}"]({lat},{lon},{radius});out;'
    try:
        response = requests.get(overpass_url, params={"data": query}, timeout=20)
        if response.status_code == 200:
            data = response.json()
            return len(data.get("elements", []))
    except Exception as e:
        print(f"Error: {e}")
    return 0

print("Testing basic tags to verify API connectivity")
print("-" * 50)

lat, lon = CITIES["Delhi"]
print(f"\nDelhi ({lat}, {lon}):")

test_tags = ["shop=supermarket", "shop=clothes", "amenity=restaurant", "amenity=atm"]
for tag in test_tags:
    result = test_tag(lat, lon, tag)
    print(f"  {tag}: {result}")
    time.sleep(1)

print(f"\nMumbai ({CITIES['Mumbai'][0]}, {CITIES['Mumbai'][1]}):")
lat, lon = CITIES["Mumbai"]
for tag in test_tags:
    result = test_tag(lat, lon, tag)
    print(f"  {tag}: {result}")
    time.sleep(1)