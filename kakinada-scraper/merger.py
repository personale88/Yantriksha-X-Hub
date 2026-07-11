import os
import re
import json
import glob
import pandas as pd

RAW_GOOGLE_DIR = "output/raw/google"
RAW_JD_DIR = "output/raw/justdial"
MERGED_DIR = "output/merged/kakinada_jewellery"

def init_dirs():
    os.makedirs(MERGED_DIR, exist_ok=True)

def clean_phone(phone_str):
    if not phone_str or pd.isna(phone_str):
        return ""
    # Keep only digits
    digits = re.sub(r"\D", "", str(phone_str))
    # Strip country code prefix (91 or 0) for local 10 digit comparisons
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    elif len(digits) > 10 and digits.startswith("0"):
        digits = digits[1:]
    return digits

def normalize_text(text):
    if not text or pd.isna(text):
        return ""
    text = str(text).lower().strip()
    # Remove punctuation
    text = re.sub(r"[^\w\s]", "", text)
    # Remove common jewellery business stop words to match the core name
    stopwords = ["jewellers", "jewellery", "jeweler", "jewelers", "gold", "silver", "shop", "store", "and", "sons", "private", "limited", "pvt", "ltd"]
    words = [w for w in text.split() if w not in stopwords]
    return " ".join(words)

def fuzzy_match(name1, name2):
    n1 = normalize_text(name1)
    n2 = normalize_text(name2)
    if not n1 or not n2:
        return False
    # Exact core name match
    if n1 == n2:
        return True
    # Substring match if name is long enough
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
                    pid = r.get("place_id")
                    if pid in seen_ids:
                        continue
                    seen_ids.add(pid)
                    
                    # Extract categories
                    types = r.get("types", [])
                    category = ", ".join(types) if types else "Jewellery"
                    
                    # Extract latitude/longitude
                    loc = r.get("geometry", {}).get("location", {})
                    lat = loc.get("lat")
                    lng = loc.get("lng")
                    
                    place_detail = {
                        "source": "google_maps",
                        "source_id": pid,
                        "name": r.get("name", ""),
                        "category": category,
                        "sector": "Retail",
                        "address": r.get("formatted_address", ""),
                        "phone": r.get("formatted_phone_number", ""), # textsearch sometimes has it
                        "website": "", # place details has it, textsearch usually not
                        "rating": r.get("rating", ""),
                        "review_count": r.get("user_ratings_total", 0),
                        "business_status": r.get("business_status", ""),
                        "opening_hours": "", # nested in place responses
                        "latitude": lat,
                        "longitude": lng,
                        "city": "Kakinada",
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
                    docid = r.get("docid") or r.get("id") or r.get("company_id")
                    if not docid:
                        continue
                    if docid in seen_ids:
                        continue
                    seen_ids.add(docid)
                    
                    # Normalise phone
                    phone = r.get("phone", "") or r.get("mobile", "") or r.get("contact", "")
                    if isinstance(phone, list) and phone:
                        phone = phone[0]
                        
                    # Extract latitude/longitude
                    lat = r.get("latitude") or r.get("lat") or r.get("map_latitude")
                    lng = r.get("longitude") or r.get("lng") or r.get("map_longitude")
                    
                    # Extract rating / review counts
                    rating = r.get("rating") or r.get("stars") or r.get("rating_value")
                    review_count = r.get("review_count") or r.get("votes") or r.get("review_count_val") or 0
                    
                    listing_detail = {
                        "source": "justdial",
                        "source_id": str(docid),
                        "name": r.get("name") or r.get("company_name") or r.get("title") or "",
                        "category": r.get("category") or r.get("mncatname") or "Jewellery",
                        "sector": "Retail",
                        "address": r.get("address") or r.get("full_address") or r.get("formatted_address") or "",
                        "phone": phone,
                        "website": r.get("website") or r.get("web") or "",
                        "rating": rating,
                        "review_count": int(review_count) if review_count else 0,
                        "business_status": "OPERATIONAL",
                        "opening_hours": r.get("hours") or r.get("opening_hours") or "",
                        "latitude": lat,
                        "longitude": lng,
                        "city": "Kakinada",
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
    
    # Save individual lists
    google_all_path = os.path.join(MERGED_DIR, "kakinada_jewellery_google_all.csv")
    jd_all_path = os.path.join(MERGED_DIR, "kakinada_jewellery_justdial_all.csv")
    
    if not df_google.empty:
        df_google.to_csv(google_all_path, index=False, encoding="utf-8-sig")
    else:
        pd.DataFrame(columns=[
            "source", "source_id", "name", "category", "sector", "address", "phone",
            "website", "rating", "review_count", "business_status", "opening_hours",
            "latitude", "longitude", "city", "state", "country"
        ]).to_csv(google_all_path, index=False, encoding="utf-8-sig")
        
    if not df_jd.empty:
        df_jd.to_csv(jd_all_path, index=False, encoding="utf-8-sig")
    else:
        pd.DataFrame(columns=[
            "source", "source_id", "name", "category", "sector", "address", "phone",
            "website", "rating", "review_count", "business_status", "opening_hours",
            "latitude", "longitude", "city", "state", "country"
        ]).to_csv(jd_all_path, index=False, encoding="utf-8-sig")
        
    # Merge & Deduplicate
    print("[Merger] Merging and deduplicating datasets...")
    merged_listings = []
    
    # Use lists of dictionaries for easier custom merging
    google_records = df_google.to_dict("records") if not df_google.empty else []
    jd_records = df_jd.to_dict("records") if not df_jd.empty else []
    
    # Track which Justdial records are merged
    merged_jd_indices = set()
    
    for g_rec in google_records:
        g_phone = clean_phone(g_rec.get("phone"))
        match_found = False
        matched_jd_rec = None
        matched_jd_idx = -1
        
        for idx, jd_rec in enumerate(jd_records):
            if idx in merged_jd_indices:
                continue
                
            jd_phone = clean_phone(jd_rec.get("phone"))
            
            # Match 1: Phone number match
            if g_phone and jd_phone and g_phone == jd_phone:
                match_found = True
                matched_jd_rec = jd_rec
                matched_jd_idx = idx
                break
                
            # Match 2: Fuzzy name match
            if fuzzy_match(g_rec.get("name"), jd_rec.get("name")):
                match_found = True
                matched_jd_rec = jd_rec
                matched_jd_idx = idx
                break
                
        if match_found:
            # Merge details
            merged_rec = g_rec.copy()
            merged_rec["source"] = "google_maps + justdial"
            # Combine source ids
            merged_rec["source_id"] = f"google:{g_rec['source_id']} | justdial:{matched_jd_rec['source_id']}"
            
            # Use longer or better populated fields
            if len(str(matched_jd_rec.get("phone"))) > len(str(g_rec.get("phone"))):
                merged_rec["phone"] = matched_jd_rec["phone"]
            if matched_jd_rec.get("website"):
                merged_rec["website"] = matched_jd_rec["website"]
            if matched_jd_rec.get("opening_hours") and not g_rec.get("opening_hours"):
                merged_rec["opening_hours"] = matched_jd_rec["opening_hours"]
                
            # Average out rating if both exist
            try:
                g_rating = float(g_rec.get("rating")) if g_rec.get("rating") else None
                jd_rating = float(matched_jd_rec.get("rating")) if matched_jd_rec.get("rating") else None
                if g_rating and jd_rating:
                    merged_rec["rating"] = round((g_rating + jd_rating) / 2, 1)
                elif jd_rating:
                    merged_rec["rating"] = jd_rating
            except Exception:
                pass
                
            # Sum up review counts
            try:
                g_reviews = int(g_rec.get("review_count") or 0)
                jd_reviews = int(matched_jd_rec.get("review_count") or 0)
                merged_rec["review_count"] = g_reviews + jd_reviews
            except Exception:
                pass
                
            merged_listings.append(merged_rec)
            merged_jd_indices.add(matched_jd_idx)
        else:
            merged_listings.append(g_rec)
            
    # Add remaining unmerged JustDial records
    for idx, jd_rec in enumerate(jd_records):
        if idx not in merged_jd_indices:
            merged_listings.append(jd_rec)
            
    df_merged = pd.DataFrame(merged_listings)
    
    if df_merged.empty:
        # Create empty DataFrame with correct columns
        df_merged = pd.DataFrame(columns=[
            "source", "source_id", "name", "category", "sector", "address", "phone",
            "website", "rating", "review_count", "business_status", "opening_hours",
            "latitude", "longitude", "city", "state", "country"
        ])
        
    # Export outputs
    csv_path = os.path.join(MERGED_DIR, "kakinada_jewellery_merged.csv")
    json_path = os.path.join(MERGED_DIR, "kakinada_jewellery_merged.json")
    xlsx_path = os.path.join(MERGED_DIR, "kakinada_jewellery_merged.xlsx")
    
    df_merged.to_csv(csv_path, index=False, encoding="utf-8-sig")
    df_merged.to_json(json_path, orient="records", indent=2, force_ascii=False)
    df_merged.to_excel(xlsx_path, index=False)
    
    # Back up the CSV
    backup_path = os.path.join(MERGED_DIR, "kakinada_jewellery_merged_backup.csv")
    df_merged.to_csv(backup_path, index=False, encoding="utf-8-sig")
    
    print("\n=================== MERGE STATISTICS ===================")
    print(f"Total Google-only listings: {len(df_google) - len(merged_jd_indices)}")
    print(f"Total JustDial-only listings: {len(df_jd) - len(merged_jd_indices)}")
    print(f"Matched & Merged listings: {len(merged_jd_indices)}")
    print(f"Grand Total Deduplicated records: {len(df_merged)}")
    print("========================================================\n")
    print(f"[Merger] Saved merged outputs to {MERGED_DIR}/")

if __name__ == "__main__":
    run_merge()
