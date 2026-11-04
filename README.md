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