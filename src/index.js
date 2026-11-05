import fs from 'node:fs';
import path from 'node:path';

const CACHE_FILE = path.join('cache', 'catalogue-page-1.html');
const USER_AGENT = 'FlyRankInternship-A9/1.0 (+https://github.com/Evie-SE/Polite-scraper)';
const URL = 'https://books.toscrape.com/catalogue/page-1.html';
const TIMEOUT = 10000; 

async function fetchAndCache() {
    if (fs.existsSync(CACHE_FILE)) {
        const stats = fs.statSync(CACHE_FILE);
        console.log(`CACHE HIT: Loaded from ${CACHE_FILE} (${stats.size} bytes)`);
        return fs.readFileSync(CACHE_FILE, 'utf8');
    }

    console.log('FETCH: Downloading live page...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
        const response = await fetch(URL, {
            headers: { 'User-Agent': USER_AGENT },
            signal: controller.signal,
        });

    if (response.status !== 200) {
        throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const htmlContent = await response.text();
    const sizeInBytes = Buffer.byteLength(htmlContent, 'utf8');

    fs.writeFileSync(CACHE_FILE, htmlContent, 'utf-8');
    console.log(`FETCH SUCCESS: Saved to ${CACHE_FILE} (${sizeInBytes} bytes)`);
    return htmlContent;

} catch (error) {
    if (error.name === 'AbortError') {
        console.error(`ERROR: Request timed out after ${TIMEOUT} ms`);
    } else {
        console.error(`ERROR: ${error.message}`);
    }
    throw error;
} finally {
    clearTimeout(timeoutId);
}
}

fetchAndCache();

