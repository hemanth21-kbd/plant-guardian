import requests
import time

CITIES = {
    "Delhi": (28.6139, 77.2090),
    "Mumbai": (19.0760, 72.8777)
}

def test_tag_raw(lat, lon, tag, radius=50000):
    overpass_url = "https://overpass-api.de/api/interpreter"
    query = '[out:json][timeout:25];node["' + tag + '"](' + str(lat) + ',' + str(lon) + ',' + str(radius) + ');out;'
    print(f"Query: {query[:80]}")
    try:
        response = requests.get(overpass_url, params={"data": query}, timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            elements = data.get("elements", [])
            print(f"Elements: {len(elements)}")
            if elements:
                print(f"Sample: {json.dumps(elements[0], indent=2)[:200]}")
            return elements
    except Exception as e:
        print(f"Error: {e}")
    return []

print("Testing with 50km radius for Delhi")
lat, lon = CITIES["Delhi"]
print(f"\nTesting shop=supermarket around ({lat}, {lon})")
elements = test_tag_raw(lat, lon, "shop=supermarket", 50000)
print(f"Total: {len(elements)}")

print("\n" + "="*50)
print("\nTesting amenity=restaurant around Delhi")
elements = test_tag_raw(lat, lon, "amenity=restaurant", 50000)
print(f"Total: {len(elements)}")