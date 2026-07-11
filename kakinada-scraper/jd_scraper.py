import os
import time
import json
from dotenv import load_dotenv
from curl_cffi import requests

load_dotenv()

COOKIE = os.getenv("JUSTDIAL_SESSION_COOKIE")
SECURITY_TOKEN = os.getenv("JUSTDIAL_SECURITY_TOKEN")
JDPK = os.getenv("JUSTDIAL_JDPK")

RAW_DIR = "output/raw/justdial"
LOG_DIR = "output/logs"
STATE_FILE = os.path.join(LOG_DIR, "kakinada_jewellery_jd_state.json")

def init_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(LOG_DIR, exist_ok=True)

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"current_page": 1, "completed": False, "results_count": 0}

def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def make_jd_post_request(page_no, city="Kakinada", search="Jewellery Stores"):
    template_file = "output/logs/jd_request_template.json"
    if os.path.exists(template_file):
        try:
            with open(template_file, "r", encoding="utf-8") as f:
                template = json.load(f)
            url = template.get("url")
            headers = template.get("headers", {})
            payload = template.get("payload", {}).copy()
            
            # Update credentials from environment in case they changed
            headers["cookie"] = os.getenv("JUSTDIAL_SESSION_COOKIE") or headers.get("cookie")
            headers["securitytoken"] = os.getenv("JUSTDIAL_SECURITY_TOKEN") or headers.get("securitytoken")
            headers["jdpk"] = os.getenv("JUSTDIAL_JDPK") or headers.get("jdpk")
            
            # Dynamic pagination
            payload["pg_no"] = page_no
            
            response = requests.post(url, json=payload, headers=headers, impersonate="chrome120")
            return response
        except Exception as e:
            print(f"[JustDial Scraper] Warning: Failed to load request template: {e}. Falling back to default.")
            
    # Target URL from user request details
    url = "https://www.justdial.com/api/resultsPageListing?bids=09072026&searchReferer=google%7Cauto%7Clst"
    
    headers = {
        "authority": "www.justdial.com",
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "cookie": os.getenv("JUSTDIAL_SESSION_COOKIE"),
        "securitytoken": os.getenv("JUSTDIAL_SECURITY_TOKEN"),
        "jdpk": os.getenv("JUSTDIAL_JDPK"),
        "origin": "https://www.justdial.com",
        "referer": f"https://www.justdial.com/{city}/Jewellery-Stores/nct-10282098",
        "user-agent": "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Mobile Safari/537.36"
    }
    
    payload = {
        "city": city,
        "search": search,
        "pg_no": page_no
    }
    
    # We use curl_cffi with chrome mobile impersonation to avoid detection
    response = requests.post(url, json=payload, headers=headers, impersonate="chrome120")
    return response

def test_health_check():
    init_dirs()
    cookie = os.getenv("JUSTDIAL_SESSION_COOKIE")
    sectoken = os.getenv("JUSTDIAL_SECURITY_TOKEN")
    jdpk = os.getenv("JUSTDIAL_JDPK")
    
    if not cookie or not sectoken or not jdpk:
        print("[JustDial Scraper] Health Check Failed: Missing credentials in .env")
        return False
        
    print("[JustDial Scraper] Running Health Check page request...")
    try:
        res = make_jd_post_request(page_no=1)
        if res.status_code == 200:
            data = res.json()
            if isinstance(data, dict) and data.get("error") == 1:
                print(f"[JustDial Scraper] Health Check Failed. API Error message: {data.get('message')}")
                return False
            # Check structure of data
            if "results" in data or "data" in data or "resultsPageListing" in data or isinstance(data, list):
                print("[JustDial Scraper] Health Check Successful! Connection to JustDial API works.")
                return True
        print(f"[JustDial Scraper] Health Check Failed. Status Code: {res.status_code}")
        print(f"Response snippet: {res.text[:300]}")
    except Exception as e:
        print(f"[JustDial Scraper] Health Check Exception: {e}")
    return False

def run_jd_scrape(skip_health=False):
    init_dirs()
    if not skip_health:
        if not test_health_check():
            print("[JustDial Scraper] Aborting scraper run due to failed health check. Update .env cookies.")
            return
            
    state = load_state()
    if state["completed"]:
        print("[JustDial Scraper] Scraper is marked as completed in state file. (Use --reset to start fresh).")
        return
        
    page = state["current_page"]
    total_listings = state["results_count"]
    
    print(f"[JustDial Scraper] Resuming JustDial scraper starting from Page {page}...")
    
    empty_pages_limit = 3
    empty_pages_count = 0
    
    while True:
        print(f"  Fetching JustDial Page {page}...", end="", flush=True)
        try:
            res = make_jd_post_request(page)
            if res.status_code != 200:
                print(f" Error! HTTP status code: {res.status_code}")
                # Wait before retrying
                time.sleep(5)
                break
                
            data = res.json()
        except Exception as e:
            print(f" Error parser JSON: {e}")
            break
            
        # Write raw output
        timestamp = int(time.time() * 1000)
        raw_file = os.path.join(RAW_DIR, f"raw_jd_page_{page}_{timestamp}.json")
        with open(raw_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        # Justdial API results format usually has listing details list in some key
        # Check standard results key structure in JustDial JSON response
        listings = []
        if isinstance(data, dict):
            # Check keys like 'results', 'data', 'searchResult', etc.
            # Usually resultsPageListing has a results field
            listings = data.get("results", []) or data.get("data", []) or data.get("searchResult", [])
            if not listings and "resultsPageListing" in data:
                listings = data["resultsPageListing"].get("results", [])
                
        # Handle cases where listings could be inside a different nested structure
        # Or if it is a list itself
        if isinstance(data, list):
            listings = data
            
        count = len(listings)
        print(f" Got {count} listings.")
        
        if count == 0:
            empty_pages_count += 1
            if empty_pages_count >= empty_pages_limit:
                print("[JustDial Scraper] Received consecutive empty pages. Scraping completed.")
                state["completed"] = True
                break
        else:
            empty_pages_count = 0
            total_listings += count
            
        # Update progress state
        page += 1
        state["current_page"] = page
        state["results_count"] = total_listings
        save_state(state)
        
        # Be nice to JustDial backend
        time.sleep(2)
        
    save_state(state)
    print(f"[JustDial Scraper] Scraper completed. Total records saved: {total_listings}")

if __name__ == "__main__":
    run_jd_scrape()
