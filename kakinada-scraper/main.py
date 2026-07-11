import os
import argparse
import sys
from google_scraper import run_google_scrape, STATE_FILE as GOOGLE_STATE_FILE
from jd_scraper import run_jd_scrape, test_health_check, STATE_FILE as JD_STATE_FILE
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
    parser = argparse.ArgumentParser(description="Kakinada Jewellery Shops Scraper Pipeline CLI")
    
    parser.add_argument("--job", type=str, default="kakinada_jewellery", 
                        help="Scraper job name (default: kakinada_jewellery)")
                        
    parser.add_argument("--google-only", action="store_true", 
                        help="Execute Google Maps Places API grid search scraper only")
                        
    parser.add_argument("--jd-only", action="store_true", 
                        help="Execute JustDial POST scraper only")
                        
    parser.add_argument("--merge-only", action="store_true", 
                        help="Run deduplication and merge pipeline on existing scraped results")
                        
    parser.add_argument("--health-check-only", action="store_true", 
                        help="Validate JustDial session cookie state and credentials then exit")
                        
    parser.add_argument("--skip-health-check", action="store_true", 
                        help="Skip JustDial session cookies health checking validation")
                        
    parser.add_argument("--reset", action="store_true", 
                        help="Reset current state logs to restart scraping from page 1 / sector 1")
                        
    args = parser.parse_args()
    
    if args.reset:
        clear_reset()
        
    if args.health_check_only:
        print("[CLI Manager] Executing JustDial Session credentials validation...")
        success = test_health_check()
        sys.exit(0 if success else 1)
        
    # Router logic
    if args.google_only:
        print("[CLI Manager] Running Google Places scraping pipeline only.")
        run_google_scrape()
    elif args.jd_only:
        print("[CLI Manager] Running JustDial scraping pipeline only.")
        run_jd_scrape(skip_health=args.skip_health_check)
    elif args.merge_only:
        print("[CLI Manager] Running Merge & deduplication pipeline only.")
        run_merge()
    else:
        # Full run (Both scrapers + Merge)
        print("[CLI Manager] Running complete pipeline: Google + JustDial + Merge.")
        
        print("\n--- Phase 1: Google Places Scraper ---")
        run_google_scrape()
        
        print("\n--- Phase 2: JustDial Scraper ---")
        run_jd_scrape(skip_health=args.skip_health_check)
        
        print("\n--- Phase 3: Merge & Deduplication ---")
        run_merge()
        
        print("\n[CLI Manager] Complete pipeline execution finished.")

if __name__ == "__main__":
    main()
