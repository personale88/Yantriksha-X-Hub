import os
import json
import time
from playwright.sync_api import sync_playwright

RAW_DIR = "output/raw/rajahmundry_jewellery/google"
STATE_FILE = "output/logs/rajahmundry_jewellery_google_state.json"

def init_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)

# List of high-yield search queries to overcome Google Maps 120 results-per-query limit
SEARCH_QUERIES = [
    # Area-specific queries (high density jewellery zones)
    "Jewellery Shops in Main Road Rajahmundry",
    "Jewellers in Main Road Rajahmundry",
    "Gold Shops in Main Road Rajahmundry",
    "Jewellery Shops in Gandhipuram Rajahmundry",
    "Jewellers in Gandhipuram Rajahmundry",
    "Jewellery Shops in Devi Chowk Rajahmundry",
    "Jewellers in Devi Chowk Rajahmundry",
    "Jewellery Shops in Danavaipeta Rajahmundry",
    "Jewellers in Danavaipeta Rajahmundry",
    "Jewellery Shops in Aryapuram Rajahmundry",
    "Jewellers in Aryapuram Rajahmundry",
    "Jewellery Shops in Innespeta Rajahmundry",
    "Jewellery Shops in T Nagar Rajahmundry",
    "Jewellery Shops in Morampudi Rajahmundry",
    "Jewellery Shops in Prakash Nagar Rajahmundry",
    "Jewellery Shops in Mangalavarapupeta Rajahmundry",
    
    # Keyword-specific broad queries
    "Gold Jewellery Showrooms Rajahmundry",
    "Silver Jewellery Shops Rajahmundry",
    "Imitation Jewellery Stores Rajahmundry",
    "Goldsmith Gold Works Rajahmundry",
    "Bangle Shop Rajahmundry",
    "Pawn Broker Gold Rajahmundry"
]

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
    
    print(f"[Google Web Scraper] Starting multi-query Google Maps scraper for Rajahmundry ({len(unique_places)} loaded so far)...")
    
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
                print(f"[Google Web Scraper] [{q_idx}/{len(SEARCH_QUERIES)}] Skipping already completed query: '{query}'")
                continue
                
            print(f"\n[Google Web Scraper] [{q_idx}/{len(SEARCH_QUERIES)}] Scraping query: '{query}'")
            
            search_url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
            try:
                page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                time.sleep(4)
                
                feed_selector = "div[role='feed']"
                try:
                    page.wait_for_selector(feed_selector, timeout=10000)
                except Exception:
                    feed_selector = "body"
                
                # Scroll loop
                last_height = page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollHeight")
                scroll_attempts = 0
                max_attempts = 25  # Limit scrolls per query to keep it fast
                
                while scroll_attempts < max_attempts:
                    page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, 1200)")
                    time.sleep(1.8)
                    
                    content = page.content()
                    if "reached the end of the list" in content.lower():
                        break
                        
                    new_height = page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollHeight")
                    if new_height == last_height:
                        page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, -100)")
                        time.sleep(0.5)
                        page.evaluate(f"document.querySelector(\"{feed_selector}\").scrollBy(0, 400)")
                        time.sleep(1.8)
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
                                    if any(k in line.lower() for k in ["rajahmundry", "rajamahendravaram", "street", "road", "bazaar", "nagar", "opposite", "near"]):
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
                            "address": address if address else "Rajahmundry, Andhra Pradesh",
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
        
    print(f"\n[Google Web Scraper] Finished multi-query scrape. Extracted {len(unique_places)} unique places.")

if __name__ == "__main__":
    run_google_web_scrape()
