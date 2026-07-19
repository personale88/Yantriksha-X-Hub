import os
import re
import json
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

load_dotenv()

RAW_DIR = "output/raw/tirupati_jewellery/justdial"
LOG_DIR = "output/logs"
STATE_FILE = os.path.join(LOG_DIR, "tirupati_jewellery_jd_state.json")

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

def run_playwright_jd_scrape():
    init_dirs()
    state = load_state()
    
    if state["completed"]:
        print("[Playwright Scraper] Scraper is marked as completed. (Use --reset to start fresh).")
        return
        
    start_page = state["current_page"]
    total_listings = state["results_count"]
    
    print("[Playwright Scraper] Launching Playwright browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()
        page.add_init_script("delete navigator.__proto__.webdriver")
        
        captured_request = {}
        
        def handle_request(request):
            if "resultsPageListing" in request.url and request.method == "POST" and not captured_request:
                try:
                    payload = json.loads(request.post_data) if request.post_data else {}
                except Exception:
                    payload = request.post_data
                    
                captured_request["url"] = request.url
                captured_request["headers"] = request.headers.copy()
                captured_request["payload"] = payload.copy()
                print("[Playwright Scraper] Successfully intercepted resultsPageListing request template!")
                
        page.on("request", handle_request)
        
        print("[Playwright Scraper] Navigating to JustDial...")
        page.goto("https://www.justdial.com/Tirupati/Jewellery-Showrooms/nct-10282098", wait_until="domcontentloaded")
        time.sleep(6)
        
        print("[Playwright Scraper] Scrolling page down to trigger first resultsPageListing call...")
        for _ in range(6):
            page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(3)
            if captured_request:
                break
                
        if not captured_request:
            print("[Playwright Scraper] Error: Failed to capture resultsPageListing request. Aborting.")
            browser.close()
            return
            
        url = captured_request["url"]
        headers = captured_request["headers"]
        payload = captured_request["payload"]
        
        headers.pop("content-length", None)
        
        print("[Playwright Scraper] Extracting Page 1 listings from HTML page...")
        page_1_listings = []
        try:
            elements = page.locator(".store-details, .result-box, [itemprop='itemListElement']").all()
            for el in elements:
                try:
                    name = el.locator(".company-name, .store-name, [itemprop='name']").first.inner_text(timeout=1000)
                    address = el.locator(".address, .store-address, [itemprop='address']").first.inner_text(timeout=1000)
                except Exception:
                    continue
                    
                phone = ""
                try:
                    phone = el.locator(".contact, .phone, .store-phone").first.inner_text(timeout=1000)
                except Exception:
                    pass
                    
                rating = ""
                try:
                    rating = el.locator(".rating, .stars").first.inner_text(timeout=1000)
                except Exception:
                    pass
                    
                review_count = 0
                try:
                    reviews = el.locator(".votes, .reviews").first.inner_text(timeout=1000)
                    review_count = int(re.sub(r"\D", "", reviews))
                except Exception:
                    pass
                    
                page_1_listings.append({
                    "name": name,
                    "address": address,
                    "phone": phone,
                    "rating": rating,
                    "review_count": review_count
                })
        except Exception as e:
            print(f"[Playwright Scraper] Info: HTML extraction completed/skipped: {e}")
            
        if page_1_listings:
            page_1_file = os.path.join(RAW_DIR, "raw_jd_page_1_html.json")
            with open(page_1_file, "w", encoding="utf-8") as f:
                json.dump({"results": page_1_listings}, f, indent=2)
            print(f"[Playwright Scraper] Extracted {len(page_1_listings)} listings from Page 1 HTML.")
            total_listings += len(page_1_listings)
            
        js_fetch_script = """
        window.fetchPageConsole = async function(url, headers, payload, pageNo) {
            payload.pg_no = pageNo;
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(payload)
                });
                return await response.json();
            } catch (err) {
                return { "error": 1, "message": err.toString() };
            }
        }
        """
        page.evaluate(js_fetch_script)
        
        current_page = start_page if start_page > 1 else 2
        empty_pages_limit = 3
        empty_pages_count = 0
        
        print(f"\n[Playwright Scraper] Starting paginated crawl from Page {current_page}...")
        
        while True:
            print(f"  Fetching JustDial Page {current_page}...", end="", flush=True)
            
            try:
                data = page.evaluate(
                    "([u, h, p, pg]) => window.fetchPageConsole(u, h, p, pg)",
                    [url, headers, payload, current_page]
                )
                if not data or (isinstance(data, dict) and data.get("error") == 1):
                    print(f" Error: {data.get('message') if data else 'Empty response'}")
                    break
            except Exception as e:
                print(f" Request error: {e}")
                break
                
            # Save raw JSON
            timestamp = int(time.time() * 1000)
            raw_file = os.path.join(RAW_DIR, f"raw_jd_page_{current_page}_{timestamp}.json")
            with open(raw_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
                
            listings = []
            if isinstance(data, dict):
                listings = data.get("results", []) or data.get("data", []) or data.get("searchResult", [])
                if not listings and "resultsPageListing" in data:
                    listings = data["resultsPageListing"].get("results", [])
                    
                res_listing = data.get("resultsPageListing", {})
                if isinstance(res_listing, dict) and "nextdocid" in res_listing:
                    payload["nextdocid"] = res_listing["nextdocid"]
                elif "nextdocid" in data:
                    payload["nextdocid"] = data["nextdocid"]
            elif isinstance(data, list):
                listings = data
                
            count = len(listings)
            print(f" Got {count} listings.")
            
            if count == 0:
                empty_pages_count += 1
                if empty_pages_count >= empty_pages_limit:
                    print("[Playwright Scraper] Received consecutive empty pages. Scraping completed.")
                    state["completed"] = True
                    break
            else:
                empty_pages_count = 0
                total_listings += count
                
            current_page += 1
            state["current_page"] = current_page
            state["results_count"] = total_listings
            save_state(state)
            
            time.sleep(3)
            
        save_state(state)
        browser.close()
        
    print(f"\n[Playwright Scraper] Done! Total listings saved: {total_listings}")

if __name__ == "__main__":
    run_playwright_jd_scrape()
