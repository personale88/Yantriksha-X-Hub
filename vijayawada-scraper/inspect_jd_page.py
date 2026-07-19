from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    page = context.new_page()
    page.goto("https://www.justdial.com/Vijayawada/Jewellery-Showrooms/nct-10282098", wait_until="domcontentloaded")
    page.wait_for_timeout(6000)
    
    # Let's dump some class names and HTML snippets
    content = page.content()
    with open("jd_snippet.html", "w", encoding="utf-8") as f:
        f.write(content[:200000]) # save first 200kb
        
    print("Done! Saved HTML snippet.")
    browser.close()
