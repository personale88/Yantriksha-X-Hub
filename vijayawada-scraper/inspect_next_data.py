import os
import re
import json
from dotenv import load_dotenv
from curl_cffi import requests

load_dotenv()

COOKIE = os.getenv("JUSTDIAL_SESSION_COOKIE")
url = "https://www.justdial.com/Vijayawada/Jewellery-Showrooms/nct-10282098"

headers = {
    "cookie": COOKIE,
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "accept-language": "en-IN,en;q=0.9"
}

try:
    print("Fetching JustDial category page to inspect __NEXT_DATA__ structure...")
    res = requests.get(url, headers=headers, impersonate="chrome131")
    print(f"Status: {res.status_code}")
    html = res.text
    
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL)
    if m:
        data = json.loads(m.group(1))
        # Save keys to a text file for inspection
        with open("next_data_keys.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        print("Success! Dumped window.__NEXT_DATA__ to next_data_keys.json.")
        
        # Print first few elements of props
        props = data.get("props", {})
        page_props = props.get("pageProps", {})
        print("pageProps keys:", list(page_props.keys()))
        if "listData" in page_props:
            ld = page_props["listData"]
            print("listData keys:", list(ld.keys()))
            if "results" in ld:
                res_data = ld["results"]
                print("results keys:", list(res_data.keys()))
                if "columns" in res_data:
                    print("columns:", res_data["columns"])
                if "data" in res_data:
                    print(f"Number of rows in next_data: {len(res_data['data'])}")
    else:
        print("Error: __NEXT_DATA__ script tag not found in HTML response.")
        if len(html) < 1000:
            print("HTML too short, probably blocked by Akamai.")
except Exception as e:
    print(f"Error: {e}")
