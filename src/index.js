import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

const CACHE_FILE = path.join("cache", "catalogue-page-1.html");
const USER_AGENT =
  "FlyRankInternship-A9/1.0 (+https://github.com/Evie-SE/Polite-scraper)";
const START_URL = "https://books.toscrape.com/catalogue/page-1.html";
const TIMEOUT = 10000;
const REQUEST_DELAY = 600;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAndCache(url, cacheFileName) {
  fs.mkdirSync('cache', { recursive: true });
  const cacheFilePath = path.join('cache', cacheFileName);
  
  if (fs.existsSync(cacheFilePath)) {
    const stats = fs.statSync(cacheFilePath);
    console.log(`CACHE HIT: Loaded from ${cacheFilePath} (${stats.size} bytes)`);
    return fs.readFileSync(cacheFilePath, "utf8");
  }

  console.log("FETCH: Downloading live page...");
  await sleep(REQUEST_DELAY); 
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });

    if (response.status !== 200) {
      throw new Error(
        `Failed to fetch page ${url}: ${response.status} ${response.statusText}`,
      );
    }

    const htmlContent = await response.text();
    const sizeInBytes = Buffer.byteLength(htmlContent, "utf8");

    fs.writeFileSync(cacheFilePath, htmlContent, "utf-8");
    console.log(`FETCH SUCCESS: Saved to ${cacheFilePath} (${sizeInBytes} bytes)`);
    return htmlContent;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error(`ERROR: Request timed out after ${TIMEOUT} ms`);
    } else {
      console.error(`ERROR: ${error.message}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function discoverBookUrls() {
    const discoveredUrls = new Set();
    let currentUrl = START_URL;
    let pageCount = 0;

    while(currentUrl && pageCount < 3) {
        pageCount++;
        const cacheFileName = `catalogue-page-${pageCount}.html`;

        const html = await fetchAndCache(currentUrl, cacheFileName);

        const $ = cheerio.load(html);

        $('article.product_pod h3 a').each((_, element) => {
            const relativeHref = $(element).attr('href');
            if (relativeHref) {
                const absoluteUrl = new URL(relativeHref, currentUrl).href;
                discoveredUrls.add(absoluteUrl);
            }
        });

        const nextRelativeHref = $('ul.pager li.next a').attr('href');
        if(nextRelativeHref) {
            currentUrl = new URL(nextRelativeHref, currentUrl).href;
        } else {
            currentUrl = null;
        }
    }

    const uniqueUrls = Array.from(discoveredUrls);

    console.log(`catalouge_pages=${pageCount}, discovered=${discoveredUrls.size}, unique=${uniqueUrls.length}`);

    return uniqueUrls;
}

discoverBookUrls().catch(console.error);