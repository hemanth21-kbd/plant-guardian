import requests
import time

cities = {
    "Delhi": (28.6139, 77.2090),
    "Mumbai": (19.0760, 72.8777)
}

tags = ["shop=hardware", "amenity=marketplace"]

def query_osm(tag, lat, lon, radius):
    url = "https://overpass-api.de/api/interpreter"
    q = f'[out:json];node["{tag}"](around:{radius},{lat},{lon});out;'
    try:
        r = requests.get(url, params={"data": q}, timeout=30)
        if r.status_code == 200:
            return len(r.json().get("elements", []))
    except:
        pass
    return -1

print("Testing shop=hardware and amenity=marketplace")
print(f"{'City':<10} {'Tag':<25} {'Results':<10}")
print("-" * 50)

for city, (lat, lon) in cities.items():
    for tag in tags:
        time.sleep(2)
        count = -1
        attempts = 0
        while count == -1 and attempts < 3:
            count = query_osm(tag, lat, lon, 10000)
            attempts += 1
            if count == -1:
                time.sleep(5)
        print(f"{city:<10} {tag:<25} {count}")
        
print("\nDone")