import requests
import time

def test_overpass():
    overpass_url = "https://overpass-api.de/api/interpreter"
    
    # Simple test query that should work
    query = '[out:json];node(35.7,139.7,35.8,139.8);out;'
    print(f"Testing: {query}")
    
    try:
        response = requests.get(overpass_url, params={"data": query}, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Response text (first 500): {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

test_overpass()