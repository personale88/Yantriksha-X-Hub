import os
import json
from dotenv import load_dotenv
from curl_cffi import requests

load_dotenv()

COOKIE = os.getenv("JUSTDIAL_SESSION_COOKIE")
SECURITY_TOKEN = os.getenv("JUSTDIAL_SECURITY_TOKEN")
JDPK = os.getenv("JUSTDIAL_JDPK")

url = "https://www.justdial.com/api/resultsPageListing?bids=09072026&searchReferer=google%7Cauto%7Clst"

headers = {
    "authority": "www.justdial.com",
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "cookie": COOKIE,
    "securitytoken": SECURITY_TOKEN,
    "jdpk": JDPK,
    "origin": "https://www.justdial.com",
    "referer": "https://www.justdial.com/Kakinada/Jewellery-Stores/nct-10282098",
    "user-agent": "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36"
}

payloads = {
    "simple": {
        "city": "Kakinada",
        "search": "Jewellery Stores",
        "pg_no": 1
    },
    "more_params": {
        "city": "Kakinada",
        "search": "Jewellery Stores",
        "pg_no": 1,
        "stype": "category_list",
        "nearme": 0,
        "darea_flg": 0
    },
    "with_catid": {
        "city": "Kakinada",
        "search": "Jewellery Stores",
        "pg_no": 1,
        "national_catid": "10282098",
        "stype": "category_list"
    },
    "minimal": {
        "city": "Kakinada",
        "search": "Jewellery-Stores",
        "pg_no": "1"
    }
}

for name, payload in payloads.items():
    print(f"Testing payload: {name}")
    try:
        res = requests.post(url, json=payload, headers=headers, impersonate="chrome120")
        print(f"  Status: {res.status_code}")
        print(f"  Response: {res.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
