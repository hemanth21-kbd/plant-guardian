import requests
import json

# Test 1 - Farm supply shops
print('=== Test 1: Farm supply shops ===')
query = '[out:json][timeout:25];(node["shop"="farm_supply"](around:30000,20.5937,78.9629););out center;'
r = requests.post('https://overpass-api.de/api/interpreter', data=query, headers={'Content-Type': 'text/plain'}, timeout=30)
print('Status:', r.status_code)
if r.status_code == 200:
    data = r.json()
    print('Elements found:', len(data.get('elements', [])))
    if data.get('elements'): print('First:', data['elements'][0].get('tags',{}).get('name','N/A'))
else:
    print('Error:', r.text[:200])
print()

# Test 2 - Marketplaces
print('=== Test 2: Marketplaces ===')
query = '[out:json][timeout:25];(node["amenity"="marketplace"](around:30000,20.5937,78.9629););out center;'
r = requests.post('https://overpass-api.de/api/interpreter', data=query, headers={'Content-Type': 'text/plain'}, timeout=30)
print('Status:', r.status_code)
if r.status_code == 200:
    data = r.json()
    print('Elements found:', len(data.get('elements', [])))
else:
    print('Error:', r.text[:200])
print()

# Test 3 - Full backend endpoint
print('=== Test 3: Backend API ===')
try:
    r = requests.get('https://plant-guardian-backend.onrender.com/places/nearby-shops?lat=20.5937&lon=78.9629&radius=30000', timeout=30)
    print('Status:', r.status_code)
    if r.status_code == 200:
        data = r.json()
        print('JSON Response:', json.dumps(data, indent=2))
    else:
        print('Error:', r.text[:500])
except Exception as e:
    print('Exception:', str(e))