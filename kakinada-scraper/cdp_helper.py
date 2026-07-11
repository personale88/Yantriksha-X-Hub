import os
import json
import time
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

load_dotenv()

CDP_URL = os.getenv("JUSTDIAL_CDP_URL", "http://127.0.0.1:9222")
TEMPLATE_FILE = "output/logs/jd_request_template.json"
ENV_FILE = ".env"

def update_env_file(key, value):
    if not os.path.exists(ENV_FILE):
        with open(ENV_FILE, "w", encoding="utf-8") as f:
            f.write(f"{key}={value}\n")
        return
        
    with open(ENV_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    updated = False
    new_lines = []
    for line in lines:
        if line.startswith(f"{key}="):
            new_lines.append(f"{key}={value}\n")
            updated = True
        else:
            new_lines.append(line)
            
    if not updated:
        new_lines.append(f"{key}={value}\n")
        
    with open(ENV_FILE, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

def run_cdp_capture():
    os.makedirs(os.path.dirname(TEMPLATE_FILE), exist_ok=True)
    
    print(f"[CDP Helper] Connecting to Chrome debugging session at {CDP_URL}...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.connect_over_cdp(CDP_URL)
            
            # Find or open JustDial page
            target_page = None
            for context in browser.contexts:
                for page in context.pages:
                    if "justdial.com" in page.url:
                        target_page = page
                        break
                if target_page:
                    break
                    
            if not target_page:
                print("[CDP Helper] Justdial page not open in Chrome. Opening new tab...")
                context = browser.contexts[0] if browser.contexts else browser.new_context()
                target_page = context.new_page()
                target_page.goto("https://www.justdial.com/Kakinada/Jewellery-Stores/nct-10282098", wait_until="domcontentloaded")
            else:
                print(f"[CDP Helper] Found active JustDial tab: {target_page.url}")
                
            captured_data = {}
            
            def handle_request(request):
                if "resultsPageListing" in request.url and request.method == "POST":
                    print(f"[CDP Helper] Intercepted resultsPageListing POST request!")
                    
                    headers = request.headers
                    post_data = request.post_data
                    
                    # Try to parse post data as JSON
                    try:
                        post_json = json.loads(post_data) if post_data else {}
                    except Exception:
                        post_json = post_data
                        
                    captured_data["url"] = request.url
                    captured_data["headers"] = headers
                    captured_data["payload"] = post_json
                    
                    # Update credentials in .env
                    cookie = headers.get("cookie", "")
                    sectoken = headers.get("securitytoken", "")
                    jdpk = headers.get("jdpk", "")
                    
                    if cookie:
                        update_env_file("JUSTDIAL_SESSION_COOKIE", cookie)
                    if sectoken:
                        update_env_file("JUSTDIAL_SECURITY_TOKEN", sectoken)
                    if jdpk:
                        update_env_file("JUSTDIAL_JDPK", jdpk)
                        
                    print("[CDP Helper] Credentials and headers updated in .env successfully.")
                    
            target_page.on("request", handle_request)
            
            print("[CDP Helper] Scrolling page down to trigger resultsPageListing loading...")
            for i in range(3):
                target_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)
                if captured_data:
                    break
                    
            if captured_data:
                with open(TEMPLATE_FILE, "w", encoding="utf-8") as f:
                    json.dump(captured_data, f, indent=2)
                print(f"[CDP Helper] Saved request payload template to {TEMPLATE_FILE}")
                return True
            else:
                print("[CDP Helper] Could not capture any resultsPageListing requests. Try scrolling manually in the browser.")
                return False
                
    except Exception as e:
        print(f"[CDP Helper] Connection error: {e}")
        print("[CDP Helper] Make sure Google Chrome is running in debug mode using start_chrome_for_jd.ps1")
        return False

if __name__ == "__main__":
    run_cdp_capture()
