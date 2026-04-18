import requests

def test_overpass():
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Test with around radius - should be: around:radius
    lat, lon = 28.6139, 77.2090
    query = f'[out:json];node["shop=supermarket"](around:10000,{lat},{lon});out;'
    print(f"Testing around query: {query}")
    
    try:
        response = requests.get(overpass_url, params={"data": query}, timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            data = response.json()
            elements = data.get("elements", [])
            print(f"Results: {len(elements)}")
    except Exception as e:
        print(f"Error: {e}")

test_overpass()