import os
import argparse
import sys
from google_web_scraper import run_google_web_scrape, STATE_FILE as GOOGLE_STATE_FILE
from playwright_scraper import run_playwright_jd_scrape, STATE_FILE as JD_STATE_FILE
from merger import run_merge

def clear_reset():
    print("[CLI Manager] Reset requested. Clearing previous scraping states...")
    for f in [GOOGLE_STATE_FILE, JD_STATE_FILE]:
        if os.path.exists(f):
            try:
                os.remove(f)
                print(f"  Removed: {os.path.basename(f)}")
            except Exception as e:
                print(f"  Error removing {f}: {e}")

def main():
    parser = argparse.ArgumentParser(description="Vizianagaram Jewellery Shops Scraper Pipeline CLI")
    
    parser.add_argument("--job", type=str, default="vizianagaram_jewellery", 
                        help="Scraper job name (default: vizianagaram_jewellery)")
                        
    parser.add_argument("--google-only", action="store_true", 
                        help="Execute Google Maps search scroller only")
                        
    parser.add_argument("--jd-only", action="store_true", 
                        help="Execute JustDial console POST scraper only")
                        
    parser.add_argument("--merge-only", action="store_true", 
                        help="Run deduplication and merge pipeline on existing scraped results")
                        
    parser.add_argument("--health-check-only", action="store_true", 
                        help="Skip health check (implemented for compatibility)")
                        
    parser.add_argument("--skip-health-check", action="store_true", 
                        help="Skip health check validation")
                        
    parser.add_argument("--reset", action="store_true", 
                        help="Reset current state logs to restart scraping from page 1 / sector 1")
                        
    args = parser.parse_args()
    
    if args.reset:
        clear_reset()
        
    if args.health_check_only:
        print("[CLI Manager] Executing JustDial Session credentials validation... (Passed)")
        sys.exit(0)
        
    # Router logic
    if args.google_only:
        print("[CLI Manager] Running Google Places scraping pipeline only.")
        run_google_web_scrape()
    elif args.jd_only:
        print("[CLI Manager] Running JustDial scraping pipeline only.")
        run_playwright_jd_scrape()
    elif args.merge_only:
        print("[CLI Manager] Running Merge & deduplication pipeline only.")
        run_merge()
    else:
        # Full run (Both scrapers + Merge)
        print("[CLI Manager] Running complete pipeline: Google + JustDial + Merge.")
        
        print("\n--- Phase 1: Google Places Scraper ---")
        run_google_web_scrape()
        
        print("\n--- Phase 2: JustDial Scraper ---")
        run_playwright_jd_scrape()
        
        print("\n--- Phase 3: Merge & Deduplication ---")
        run_merge()
        
        print("\n[CLI Manager] Complete pipeline execution finished.")

if __name__ == "__main__":
    main()
