import requests
import json

url = "https://hemanth0821-plant-guardian-backend.hf.space/ask-google"
payload = {"query": "What is the best fertilizer for roses?"}
headers = {"Content-Type": "application/json"}

try:
    print(f"Sending query: {payload['query']}")
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 200:
        print("\nSUCCESS: Received response from Google Assist:")
        print("-" * 50)
        print(response.json().get("answer"))
        print("-" * 50)
    else:
        print(f"\nFAILURE: Status Code {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"\nERROR: Could not connect to backend. Is it running? {e}")
