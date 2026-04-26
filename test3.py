import requests

query = """
[out:json][timeout:60];
(
  node["shop"="hardware"]["name"~"agri|farm|kisan|krishi|fertilizer|pesticide|seed|tractor|agro", i](around:150000,13.0827,80.2707);
  way["shop"="hardware"]["name"~"agri|farm|kisan|krishi|fertilizer|pesticide|seed|tractor|agro", i](around:150000,13.0827,80.2707);
);
out center;
"""

response = requests.post('https://overpass-api.de/api/interpreter', data=query)
print('Status:', response.status_code)
if response.status_code == 200:
    data = response.json()
    print('Count:', len(data.get('elements', [])))
else:
    print(response.text)
