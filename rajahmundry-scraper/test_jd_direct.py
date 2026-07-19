import os
import json
import time
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
    "requesttime": "2026-07-11%2022%3A10%3A44",
    "origin": "https://www.justdial.com",
    "referer": "https://www.justdial.com/Rajahmundry/Jewellery-Showrooms/nct-10282098?trkid=1174-remotecity&term=Jewellery%20S&cbflg=2",
    "user-agent": "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36",
    "sec-ch-ua": '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "accept-language": "en-IN,en;q=0.9,te-IN;q=0.8,te;q=0.7,hi-IN;q=0.6,hi;q=0.5"
}

payload = {
    "city": "Rajahmundry",
    "search": "Jewellery Showrooms",
    "pg_no": 1,
    "mncatname": "Jewellery Showrooms",
    "national_catid": "10282098",
    "stype": "category_list"
}

print("Testing direct post request with fresh headers...")
try:
    res = requests.post(url, json=payload, headers=headers, impersonate="chrome131_android")
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text[:500]}")
except Exception as e:
    print(f"Error: {e}")
