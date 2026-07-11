import os
import time
import json
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY")

# Bounding box coordinates for Kakinada
# Latitude: 16.92 to 17.03, Longitude: 82.20 to 82.28
GRID_POINTS = [
    {"lat": 16.935, "lng": 82.215, "name": "South West"},
    {"lat": 16.935, "lng": 82.240, "name": "South Central"},
    {"lat": 16.935, "lng": 82.265, "name": "South East"},
    {"lat": 16.970, "lng": 82.215, "name": "Central West"},
    {"lat": 16.970, "lng": 82.240, "name": "Center"},
    {"lat": 16.970, "lng": 82.265, "name": "Central East"},
    {"lat": 17.010, "lng": 82.215, "name": "North West"},
    {"lat": 17.010, "lng": 82.240, "name": "North Central"},
    {"lat": 17.010, "lng": 82.265, "name": "North East"},
]

KEYWORDS = ["jewellery shop", "jewellers", "gold shop", "silver shop"]

RAW_DIR = "output/raw/google"
LOG_DIR = "output/logs"
STATE_FILE = os.path.join(LOG_DIR, "kakinada_jewellery_google_state.json")

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
    return {"completed_sectors": [], "results_count": 0}

def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def scrape_places_text_search(query, lat, lng, radius=2500):
    places = []
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": f"{query} in Kakinada",
        "location": f"{lat},{lng}",
        "radius": radius,
        "key": GOOGLE_MAPS_API_KEY
    }
    
    page = 1
    next_page_token = None
    
    while True:
        if next_page_token:
            # Wait 2 seconds for next_page_token to become active
            time.sleep(2)
            params = {
                "pagetoken": next_page_token,
                "key": GOOGLE_MAPS_API_KEY
            }
            
        print(f"  Querying: '{query}' Page {page}...", end="", flush=True)
        try:
            response = requests.get(url, params=params, timeout=15)
            data = response.json()
        except Exception as e:
            print(f" Error: {e}")
            break
            
        status = data.get("status")
        if status not in ["OK", "ZERO_RESULTS"]:
            print(f" API Error status: {status}. Message: {data.get('error_message', '')}")
            break
            
        results = data.get("results", [])
        places.extend(results)
        print(f" Got {len(results)} places.")
        
        # Save raw output
        timestamp = int(time.time() * 1000)
        raw_file = os.path.join(RAW_DIR, f"raw_google_{lat}_{lng}_{timestamp}.json")
        with open(raw_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            
        next_page_token = data.get("next_page_token")
        if not next_page_token:
            break
        page += 1
        
    return places

def run_google_scrape():
    init_dirs()
    if not GOOGLE_MAPS_API_KEY or GOOGLE_MAPS_API_KEY == "YOUR_GOOGLE_MAPS_API_KEY":
        print("[Google Scraper] Error: GOOGLE_MAPS_API_KEY is not configured in .env file.")
        return
        
    state = load_state()
    all_places = {}
    
    # Load previously saved raw files if resuming to build memory
    # (Just in case to avoid duplicates in logs)
    print("[Google Scraper] Starting Google Maps Place queries...")
    
    for idx, pt in enumerate(GRID_POINTS):
        sector_id = f"{pt['lat']}_{pt['lng']}"
        if sector_id in state["completed_sectors"]:
            print(f"Sector {idx+1}/{len(GRID_POINTS)} ({pt['name']}) already completed. Skipping.")
            continue
            
        print(f"\nSector {idx+1}/{len(GRID_POINTS)} ({pt['name']}) [Lat: {pt['lat']}, Lng: {pt['lng']}]:")
        for kw in KEYWORDS:
            places = scrape_places_text_search(kw, pt["lat"], pt["lng"])
            for p in places:
                all_places[p["place_id"]] = p
                
        state["completed_sectors"].append(sector_id)
        state["results_count"] = len(all_places)
        save_state(state)
        
    print(f"\n[Google Scraper] Finished. Found {state['results_count']} total raw Google listings.")

if __name__ == "__main__":
    run_google_scrape()
