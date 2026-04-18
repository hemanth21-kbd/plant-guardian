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

def test_tag(tag, lat, lon, radius=10000):
    query = f'[out:json];node["{tag}"](around:{radius},{lat},{lon});out;'
    try:
        response = requests.get("https://overpass-api.de/api/interpreter", 
                              params={"data": query}, timeout=30)
        if response.status_code == 200:
            data = response.json()
            return len(data.get("elements", []))
    except:
        pass
    return -1

print("City        Tag                       Results")
print("-" * 55)

for city in ["Delhi", "Mumbai"]:
    lat, lon = CITIES[city]
    print(f"\n{city} ({lat}, {lon}):")
    for tag in TAGS:
        result = -1
        while result == -1:
            result = test_tag(tag, lat, lon, 10000)
            if result == -1:
                print(f"  Retry {tag}...")
                time.sleep(3)
        print(f"  {tag:<25} {result}")
        time.sleep(2)