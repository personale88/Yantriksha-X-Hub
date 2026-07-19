import os
import re
import json
import glob
import pandas as pd

RAW_GOOGLE_DIR = "output/raw/vizianagaram_jewellery/google"
RAW_JD_DIR = "output/raw/vizianagaram_jewellery/justdial"
MERGED_DIR = "output/merged/vizianagaram_jewellery"

def init_dirs():
    os.makedirs(MERGED_DIR, exist_ok=True)

def clean_phone(phone_str):
    if not phone_str or pd.isna(phone_str):
        return ""
    digits = re.sub(r"\D", "", str(phone_str))
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) > 10 and digits.startswith("0"):
        digits = digits[1:]
    return digits

def normalize_text(text):
    if not text or pd.isna(text):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    stopwords = ["jewellers", "jewellery", "jeweler", "jewelers", "gold", "silver", "shop", "store", "and", "sons", "private", "limited", "pvt", "ltd"]
    words = [w for w in text.split() if w not in stopwords]
    return " ".join(words)

def fuzzy_match(name1, name2):
    n1 = normalize_text(name1)
    n2 = normalize_text(name2)
    if not n1 or not n2:
        return False
    if n1 == n2:
        return True
    if len(n1) > 4 and len(n2) > 4:
        if n1 in n2 or n2 in n1:
            return True
    return False

def parse_google_places():
    places = []
    files = glob.glob(os.path.join(RAW_GOOGLE_DIR, "raw_google_*.json"))
    seen_ids = set()
    
    for f in files:
        try:
            with open(f, "r", encoding="utf-8") as file:
                data = json.load(file)
                results = data.get("results", [])
                for r in results:
                    pid = r.get("place_id") or r.get("id")
                    if not pid:
                        continue
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)
                    
                    if "formatted_address" in r or "geometry" in r:
                        types = r.get("types", [])
                        category = ", ".join(types) if types else "Jewellery"
                        loc = r.get("geometry", {}).get("location", {})
                        lat = loc.get("lat")
                        lng = loc.get("lng")
                        address = r.get("formatted_address", "")
                        phone = r.get("formatted_phone_number", "")
                        rating = r.get("rating", "")
                        review_count = r.get("user_ratings_total", 0)
                    else:
                        category = "Jewellery"
                        lat = None
                        lng = None
                        address = r.get("address", "")
                        phone = r.get("phone", "")
                        rating = r.get("rating", "")
                        review_count = r.get("reviews_count", 0)
                        
                    place_detail = {
                        "source": "google_maps",
                        "source_id": pid,
                        "name": r.get("name", ""),
                        "category": category,
                        "sector": "Retail",
                        "address": address,
                        "phone": phone,
                        "website": r.get("website", ""),
                        "rating": rating,
                        "review_count": review_count,
                        "business_status": r.get("business_status", "OPERATIONAL"),
                        "opening_hours": "",
                        "latitude": lat,
                        "longitude": lng,
                        "city": "Vizianagaram",
                        "state": "Andhra Pradesh",
                        "country": "India"
                    }
                    places.append(place_detail)
        except Exception as e:
            print(f"Error parsing Google file {f}: {e}")
            
    return pd.DataFrame(places)

def parse_justdial_listings():
    listings = []
    files = glob.glob(os.path.join(RAW_JD_DIR, "raw_jd_page_*.json"))
    seen_ids = set()
    
    for f in files:
        try:
            with open(f, "r", encoding="utf-8") as file:
                data = json.load(file)
                results = []
                if isinstance(data, dict):
                    results = data.get("results", []) or data.get("data", []) or data.get("searchResult", [])
                    if not results and "resultsPageListing" in data:
                        results = data["resultsPageListing"].get("results", [])
                elif isinstance(data, list):
                    results = data
                    
                for r in results:
                    docid = r.get("docid") or r.get("id") or r.get("company_id") or r.get("name")
                    if not docid:
                        continue
                    if docid in seen_ids:
                        continue
                    seen_ids.add(docid)
                    
                    phone = r.get("phone", "") or r.get("mobile", "") or r.get("contact", "")
                    if isinstance(phone, list) and phone:
                        phone = phone[0]
                        
                    lat = r.get("latitude") or r.get("lat") or r.get("map_latitude")
                    lng = r.get("longitude") or r.get("lng") or r.get("map_longitude")
                    
                    rating = r.get("rating") or r.get("stars") or r.get("rating_value")
                    review_count = r.get("review_count") or r.get("votes") or r.get("review_count_val") or 0
                    
                    listing_detail = {
                        "source": "justdial",
                        "source_id": docid,
                        "name": r.get("name", "") or r.get("comp_name", ""),
                        "category": r.get("mncatname", "Jewellery"),
                        "sector": "Retail",
                        "address": r.get("address", "") or r.get("formatted_address", ""),
                        "phone": phone,
                        "website": r.get("website", "") or r.get("web_url", ""),
                        "rating": rating,
                        "review_count": review_count,
                        "business_status": "OPERATIONAL",
                        "opening_hours": "",
                        "latitude": lat,
                        "longitude": lng,
                        "city": "Vizianagaram",
                        "state": "Andhra Pradesh",
                        "country": "India"
                    }
                    listings.append(listing_detail)
        except Exception as e:
            print(f"Error parsing JustDial file {f}: {e}")
            
    return pd.DataFrame(listings)

def run_merge():
    init_dirs()
    print("[Merger] Parsing raw Google Places responses...")
    df_google = parse_google_places()
    print(f"[Merger] Extracted {len(df_google)} raw Google Maps listings.")
    
    print("[Merger] Parsing raw JustDial responses...")
    df_jd = parse_justdial_listings()
    print(f"[Merger] Extracted {len(df_jd)} raw JustDial listings.")
    
    # Save individual source exports
    if not df_google.empty:
        df_google.to_csv(os.path.join(MERGED_DIR, "vizianagaram_jewellery_google_all.csv"), index=False, encoding="utf-8-sig")
    if not df_jd.empty:
        df_jd.to_csv(os.path.join(MERGED_DIR, "vizianagaram_jewellery_justdial_all.csv"), index=False, encoding="utf-8-sig")
        
    if df_google.empty and df_jd.empty:
        print("[Merger] Warning: No records to merge.")
        return
        
    print("[Merger] Merging and deduplicating datasets...")
    
    merged_records = []
    
    # Track items matched
    matched_jd_ids = set()
    google_only_count = 0
    jd_only_count = 0
    merged_count = 0
    
    for idx_g, row_g in df_google.iterrows():
        matched_row_jd = None
        
        # 1. Match on phone first
        phone_g = clean_phone(row_g["phone"])
        if phone_g and not df_jd.empty:
            for idx_j, row_j in df_jd.iterrows():
                if row_j["source_id"] in matched_jd_ids:
                    continue
                phone_j = clean_phone(row_j["phone"])
                if phone_j and phone_g == phone_j:
                    matched_row_jd = row_j
                    break
                    
        # 2. Match on fuzzy name and address
        if matched_row_jd is None and not df_jd.empty:
            for idx_j, row_j in df_jd.iterrows():
                if row_j["source_id"] in matched_jd_ids:
                    continue
                if fuzzy_match(row_g["name"], row_j["name"]):
                    matched_row_jd = row_j
                    break
                    
        if matched_row_jd is not None:
            # Combine record, prioritizing Google details
            matched_jd_ids.add(matched_row_jd["source_id"])
            merged_record = row_g.to_dict()
            merged_record["source"] = "merged"
            merged_record["source_id"] = f"{row_g['source_id']};{matched_row_jd['source_id']}"
            if not merged_record["phone"] and matched_row_jd["phone"]:
                merged_record["phone"] = matched_row_jd["phone"]
            if not merged_record["website"] and matched_row_jd["website"]:
                merged_record["website"] = matched_row_jd["website"]
            merged_records.append(merged_record)
            merged_count += 1
        else:
            merged_records.append(row_g.to_dict())
            google_only_count += 1
            
    # Add remaining JustDial-only records
    if not df_jd.empty:
        for idx_j, row_j in df_jd.iterrows():
            if row_j["source_id"] not in matched_jd_ids:
                merged_records.append(row_j.to_dict())
                jd_only_count += 1
                
    df_merged = pd.DataFrame(merged_records)
    
    # Save files
    merged_csv = os.path.join(MERGED_DIR, "vizianagaram_jewellery_merged.csv")
    merged_json = os.path.join(MERGED_DIR, "vizianagaram_jewellery_merged.json")
    merged_xlsx = os.path.join(MERGED_DIR, "vizianagaram_jewellery_merged.xlsx")
    backup_csv = os.path.join(MERGED_DIR, "vizianagaram_jewellery_merged_backup.csv")
    
    df_merged.to_csv(merged_csv, index=False, encoding="utf-8-sig")
    df_merged.to_csv(backup_csv, index=False, encoding="utf-8-sig")
    
    # Save JSON
    with open(merged_json, "w", encoding="utf-8") as f:
        json.dump(merged_records, f, indent=2)
        
    # Save Excel
    df_merged.to_excel(merged_xlsx, index=False)
    
    print("\n=================== MERGE STATISTICS ===================")
    print(f"Total Google-only listings: {google_only_count}")
    print(f"Total JustDial-only listings: {jd_only_count}")
    print(f"Matched & Merged listings: {merged_count}")
    print(f"Grand Total Deduplicated records: {len(df_merged)}")
    print("========================================================\n")
    print(f"[Merger] Saved merged outputs to {MERGED_DIR}/")

if __name__ == "__main__":
    run_merge()
