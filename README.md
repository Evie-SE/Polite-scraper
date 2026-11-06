# Polite-scraper

A polite web scraping pipeline built for FlyRank Internship Week 5 Assignment A9.

## Target Classification

* **Target Site:** Books to Scrape (`https://books.toscrape.com`)
* **Purpose:** Built specifically as a public practice sandbox for web scraping development and testing.
* **Scope:** Restricted strictly to the first **3 catalogue pages** (discovering 60 unique book URLs).
* **Data Collected:** `title`, `product_url`, `price_text`, `availability_text`, `rating_text`, `description`, `source_page`, and `fetched_at`.
* **Robots.txt Check:** Requested `https://books.toscrape.com/robots.txt` (returns HTTP 404 / no specific restrictions found).
* **Appropriateness:** Safe and compliant to scrape because the site explicitly identifies itself as a public sandbox created for scraping practice.

> I will not reuse this code on another site without checking its rules and terms first.


## Pipeline Progress Check

[x] Stage 0: Target Classification — Check robots.txt and add target statement to README.md.

[x] Stage 1: Fetch Once, Cache Once — Implemented caching layer and polite headers in fetchAndCache.

[x] Stage 2: Discover Catalogue Pages — Discovered 3 catalogue pages and 60 unique book URLs.

[x] Stage 3: Extract Raw Records — Extracted all 8 raw fields for 60 book detail pages.

[ ] Stage 4: Clean, Validate & Store — Add Zod schema, normalize prices/ratings, write to output/books.json.

[ ] Stage 5: Fail-Safe & Run Report — Add 5xx retry logic, skip bad pages safely, write output/run-report.json.

[ ] Stage 6: Publish Evidence & Final README — Clean repo, commit 7+ stage checkpoints, update README.md