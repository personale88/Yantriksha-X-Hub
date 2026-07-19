import os
import json
import glob
import re

SOURCE_DIR = r"C:\Users\VIGNESH\Downloads\vizag-scraper\vizag-scraper\output\raw\vizianagaram_jewellery\google"
DEST_RAW_DIR = "output/raw/vizianagaram_jewellery/google"
DEST_LOG_DIR = "output/logs"

def clean_query_from_filename(filename):
    basename = os.path.basename(filename)
    basename = basename.replace(".json", "")
    
    if basename.startswith("grid__"):
        parts = basename.split("__")
        if len(parts) >= 4:
            kw = parts[1].replace("_", " ").title()
            area = parts[2].replace("_", " ").title()
            return f"{kw} in {area} Vizianagaram"
    elif basename.startswith("text__"):
        parts = basename.split("__")
        if len(parts) >= 3:
            kw = parts[1].replace("_", " ").title()
            return f"{kw} Vizianagaram"
            
    # Default fallback
    q = basename.replace("__", " ").replace("_", " ").title()
    return q

def run_import():
    os.makedirs(DEST_RAW_DIR, exist_ok=True)
    os.makedirs(DEST_LOG_DIR, exist_ok=True)
    
    state_file = os.path.join(DEST_LOG_DIR, "vizianagaram_jewellery_google_state.json")
    
    # Load state or initialize
    state = {"completed_queries": [], "results_count": 0, "unique_places": {}}
    if os.path.exists(state_file):
        try:
            with open(state_file, "r", encoding="utf-8") as f:
                state = json.load(f)
        except Exception:
            pass
            
    completed_queries = state.setdefault("completed_queries", [])
    unique_places = state.setdefault("unique_places", {})
    
    json_files = glob.glob(os.path.join(SOURCE_DIR, "*.json"))
    print(f"Found {len(json_files)} existing Vizianagaram raw files in Downloads.")
    
    for f in json_files:
        query_str = clean_query_from_filename(f)
        print(f"Processing: {os.path.basename(f)} -> Query: '{query_str}'")
        
        try:
            with open(f, "r", encoding="utf-8") as file:
                data = json.load(file)
                if not isinstance(data, list):
                    continue
                    
                for r in data:
                    place_id = r.get("source_id") or r.get("place_id")
                    if not place_id:
                        continue
                        
                    name = r.get("name", "")
                    if not name:
                        continue
                        
                    unique_places[place_id] = {
                        "name": name,
                        "rating": str(r.get("rating", "")),
                        "reviews_count": int(r.get("review_count") or r.get("reviews_count") or 0),
                        "address": r.get("address", "Vizianagaram, Andhra Pradesh"),
                        "phone": r.get("phone", ""),
                        "maps_url": r.get("maps_url") or f"https://www.google.com/maps/place/Vizianagaram/data=!4m7!3m6!1s{place_id}",
                        "place_id": place_id
                    }
                    
            if query_str not in completed_queries:
                completed_queries.append(query_str)
        except Exception as e:
            print(f"Error reading file {f}: {e}")
            
    state["results_count"] = len(unique_places)
    
    # Save log state
    with open(state_file, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
        
    # Save raw consolidated file
    raw_list = list(unique_places.values())
    raw_dest_file = os.path.join(DEST_RAW_DIR, "raw_google_web.json")
    with open(raw_dest_file, "w", encoding="utf-8") as f:
        json.dump({"results": raw_list}, f, indent=2)
        
    print(f"\nImport Complete! Imported {len(unique_places)} unique places across {len(completed_queries)} queries.")

if __name__ == "__main__":
    run_import()
