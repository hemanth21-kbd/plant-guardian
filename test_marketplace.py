import requests

# Retrying Test 2
print('=== Retry Test 2: Marketplaces ===')
query = '[out:json][timeout:25];(node["amenity"="marketplace"](around:30000,20.5937,78.9629););out center;'
r = requests.post('https://overpass-api.de/api/interpreter', data=query, headers={'Content-Type': 'text/plain'}, timeout=60)
print('Status:', r.status_code)
print('Response length:', len(r.text))
if r.status_code == 200:
    data = r.json()
    print('Elements found:', len(data.get('elements', [])))
else:
    print('Error:', r.text[:300])