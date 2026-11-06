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
    const discovered = new Map();
    let currentUrl = START_URL;
    let pageCount = 0;

    while(currentUrl && pageCount < 3) {
        pageCount++;
        const cacheFileName = `catalogue-page-${pageCount}.html`;
        const sourcePageUrl = currentUrl;

        const html = await fetchAndCache(sourcePageUrl, cacheFileName);

        const $ = cheerio.load(html);

        $('article.product_pod h3 a').each((_, element) => {
            const relativeHref = $(element).attr('href');
            if (relativeHref) {
                const absoluteUrl = new URL(relativeHref, sourcePageUrl).href;
                if (!discovered.has(absoluteUrl)) {
                    discovered.set(absoluteUrl, sourcePageUrl);
                }
            }
        });

        const nextRelativeHref = $('ul.pager li.next a').attr('href');
        if(nextRelativeHref) {
            currentUrl = new URL(nextRelativeHref, sourcePageUrl).href;
        } else {
            currentUrl = null;
        }
    }

    const books = Array.from(discovered, ([productUrl, sourcePageUrl]) => ({
        productUrl,
        sourcePageUrl,
    }));

    console.log(`catalogue_pages=${pageCount}, discovered=${discovered.size}, unique=${books.length}`);

    return books;
}



async function extractRawBookRecord(productUrl, sourcePageUrl, index) {
  const cacheFileName = `book-detail-${index + 1}.html`;
  const html = await fetchAndCache(productUrl, cacheFileName);
  const $ = cheerio.load(html);

  const productMain = $('.product_main');

  const title = productMain.find('h1').text().trim();
  const priceText = productMain.find('.price_color').text().trim();
  const availabilityText = productMain.find('.availability').text().trim();

  const ratingClass = productMain.find('.star-rating').attr('class') || '';
  const ratingText = ratingClass.replace('star-rating', '').trim();

  const descriptionEl = $('#product_description').next('p');
  const description = descriptionEl.length > 0 ? descriptionEl.text().trim() : null;

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    availability_text: availabilityText,
    rating_text: ratingText,
    description,
    source_page: sourcePageUrl,
    fetched_at: new Date().toISOString()
  };
}

async function runStage3() {
  console.log('Discovering catalogue links...');
  const booksToFetch = await discoverBookUrls();

  console.log(`Extracting ${booksToFetch.length} book detail pages...`);
  const rawRecords = [];

  for (let i = 0; i < booksToFetch.length; i++) {
    const { productUrl, sourcePageUrl } = booksToFetch[i];
    const record = await extractRawBookRecord(productUrl, sourcePageUrl, i);
    rawRecords.push(record);
  }


  console.log('\n--- SAMPLE RAW RECORD (Book 1) ---');
  console.log(JSON.stringify(rawRecords[0], null, 2));

  console.log(`\ndetail_pages=${rawRecords.length}`);
}


runStage3().catch(console.error);