import urllib.request
import json

try:
    print("Checking if Chrome CDP port 9222 is active...")
    with urllib.request.urlopen("http://127.0.0.1:9222/json/version", timeout=3) as res:
        data = json.loads(res.read().decode())
        print("CDP Connection OK! Response details:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"CDP Port 9222 is NOT reachable: {e}")
