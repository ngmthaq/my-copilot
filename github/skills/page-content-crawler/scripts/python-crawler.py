import sys
import json
from playwright.sync_api import sync_playwright

url = sys.argv[1]

if not url:
    print(json.dumps({"error": "URL required"}))
    exit(1)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    page.goto(url, wait_until="networkidle")
    page.wait_for_timeout(2000)

    data = page.evaluate("""
    () => {
        const title =
            document.querySelector('title')?.innerText ||
            document.querySelector('h1')?.innerText || '';

        const headings = Array.from(document.querySelectorAll('h1,h2,h3'))
            .map(e => e.innerText.trim())
            .filter(Boolean);

        const links = Array.from(document.querySelectorAll('a'))
            .filter(a => a.href && !a.href.startsWith('#'))
            .map(a => ({ text: a.innerText.trim(), href: a.href }));

        const main =
            document.querySelector('main') ||
            document.querySelector('article') ||
            document.body;

        return {
            title,
            headings,
            links,
            main_content: main.innerText || ''
        };
    }
    """)

    print(json.dumps(data, ensure_ascii=False, indent=2))
    browser.close()