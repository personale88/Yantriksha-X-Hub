import os
import json
import time
from playwright.sync_api import sync_playwright

RAW_DIR = "output/raw/vizianagaram_jewellery/google"
STATE_FILE = "output/logs/vizianagaram_jewellery_google_state.json"

def init_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)

# Define dense grid zones in Vizianagaram
NEIGHBORHOODS = [
    "Clock Tower Area", "MG Road", "Cantonment Area", "Phool Bagh", "Santhapet",
    "Ring Road", "Babametta", "Balaji Nagar", "Dasannapeta", "Chinna Veedhi",
    "Kota Junction", "Tankbund Road", "Perlavari Street", "Dharmapuri", "Sarika Junction",
    "Bhogapuram", "Bobbili", "Kothavalasa", "Gajapathinagaram", "Nellimarla",
    "Cheepurupalli", "Salur", "Parvathipuram", "Srungavarapukota", "Pusapatirega",
    "Lakkavarapukota", "Jami", "Vepada", "Bondapalli", "Mentada",
    "Dattirajeru", "Terlam", "Badangi", "Makkuva", "Komarada",
    "Kurupam", "Gummalaxmipuram", "Jithuvalasa", "Kinnera Area", "Jammu Narayana Puram",
    "Gunkalam", "Jonnada", "Garividi", "Merakamudidam", "Therlam",
    "Ramabhadrapuram", "Bobbili Rural", "Gantyada", "Lakkavarapukota Rural", "Vaddadi",
    "Kella", "Gotlam", "Dwarapudi", "Pedada", "Kanapaka",
    "Chollangipeta", "Gajuwaka Route", "Tagarapuvalasa Route", "Chipurupalle", "Gurla"
]

# Define primary jewellery-related keywords
KEYWORDS = [
    "Jewellery Shop", "Gold Shop", "Jewellers", "Jewellery Showroom", 
    "Silver Jewellery", "Diamond Jewellery", "Imitation Jewellery", "Goldsmith",
    "Antique Jewellery", "Fashion Jewellery", "Traditional Jewellery", "Hallmark Jewellery"
]

# Dynamically generate dense search query grid
SEARCH_QUERIES = []
for area in NEIGHBORHOODS:
    for kw in KEYWORDS:
        SEARCH_QUERIES.append(f"{kw} in {area} Vizianagaram")

# Add broad category searches
BROAD_QUERIES = [
    "Jewellery Shop Vizianagaram",
    "Jewellers Vizianagaram",
    "Gold Shop Vizianagaram",
    "Silver Shop Vizianagaram",
    "Diamond Store Vizianagaram",
    "Bridal Jewellery Vizianagaram",
    "Wedding Jewellery Vizianagaram",
    "Hallmark Jewellery Vizianagaram",
    "Luxury Jewellery Vizianagaram",
    "Precious Metal Dealers Vizianagaram",
    "Gold Merchants Vizianagaram",
    "Gold Dealers Vizianagaram",
    "Traditional Jewellery Vizianagaram",
    "Fashion Jewellery Vizianagaram"
]

SEARCH_QUERIES = BROAD_QUERIES + SEARCH_QUERIES

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"completed_queries": [], "results_count": 0, "unique_places": {}}

def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)

def run_google_web_scrape():
    init_dirs()
    state = load_state()
    
    completed_queries = state.setdefault("completed_queries", [])
    unique_places = state.setdefault("unique_places", {})
    
    print(f"[Google Web Scraper] Starting dense search query loop for Vizianagaram ({len(unique_places)} places loaded)...")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = context.new_page()
        page.add_init_script("delete navigator.__proto__.webdriver")
        
        for q_idx, query in enumerate(SEARCH_QUERIES, 1):
            if query in completed_queries:
                continue
                
            print(f"\n[Google Web Scraper] [{q_idx}/{len(SEARCH_QUERIES)}] Query: '{query}'")
            
            search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
            try:
                page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                time.sleep(3.5)
                
                feed_selector = "div[role='feed']"
                try:
                    page.wait_for_selector(feed_selector, timeout=8000)
                except Exception:
                    feed_selector = "body"
                
                # Scroll loop
                last_height = page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollHeight")
                scroll_attempts = 0
                max_attempts = 15
                
                while scroll_attempts < max_attempts:
                    page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, 1200)")
                    time.sleep(1.5)
                    
                    content = page.content()
                    if "reached the end of the list" in content.lower():
                        break
                        
                    new_height = page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollHeight")
                    if new_height == last_height:
                        page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, -100)")
                        time.sleep(0.5)
                        page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, 400)")
                        time.sleep(1.5)
                        new_height = page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollHeight")
                        if new_height == last_height:
                            break
                            
                    last_height = new_height
                    scroll_attempts += 1
                    
                # Extract listings
                listings_selectors = "a[href*='/maps/place/']"
                elements = page.locator(listings_selectors).all()
                query_extracted = 0
                
                for el in elements:
                    try:
                        href = el.get_attribute("href")
                        if not href:
                            continue
                            
                        card = el.locator("xpath=../..")
                        
                        name = el.get_attribute("aria-label") or el.inner_text()
                        if not name:
                            continue
                        name = name.replace("·", "").strip()
                        
                        place_id = href.split("/place/")[1].split("/")[0]
                        if place_id in unique_places:
                            continue
                            
                        rating = ""
                        reviews_count = 0
                        try:
                            rating_el = card.locator("span[aria-label*='stars']").first
                            if rating_el.count() > 0:
                                aria_label = rating_el.get_attribute("aria-label")
                                parts = aria_label.split(" ")
                                rating = parts[0]
                                reviews_count = int(parts[2].replace(",", ""))
                        except Exception:
                            pass
                            
                        address = ""
                        phone = ""
                        try:
                            text_blocks = card.locator("div").all_inner_texts()
                            for text in text_blocks:
                                lines = [l.strip() for l in text.split("\n") if l.strip()]
                                for line in lines:
                                    if any(k in line.lower() for k in ["vizianagaram", "street", "road", "bazaar", "nagar", "opposite", "near", "circle"]):
                                        if len(line) > 10 and not line.startswith("Open") and not line.startswith("Closed"):
                                            address = line
                                    elif line.startswith("+91") or (line.replace(" ", "").isdigit() and len(line.replace(" ", "")) >= 10):
                                        phone = line
                        except Exception:
                            pass
                            
                        unique_places[place_id] = {
                            "name": name,
                            "rating": rating,
                            "reviews_count": reviews_count,
                            "address": address if address else "Vizianagaram, Andhra Pradesh",
                            "phone": phone,
                            "maps_url": href,
                            "place_id": place_id
                        }
                        query_extracted += 1
                    except Exception:
                        pass
                        
                print(f"  Extracted {query_extracted} new places (Total unique places: {len(unique_places)})")
                completed_queries.append(query)
                state["results_count"] = len(unique_places)
                save_state(state)
                
                # Incremental output save
                results_list = list(unique_places.values())
                output_file = os.path.join(RAW_DIR, "raw_google_web.json")
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump({"results": results_list}, f, indent=2)
                    
            except Exception as e:
                print(f"  Error processing query '{query}': {e}")
                time.sleep(5)
                
        browser.close()
        
    print(f"\n[Google Web Scraper] Finished dense query scrape. Extracted {len(unique_places)} unique places.")

if __name__ == "__main__":
    run_google_web_scrape()
