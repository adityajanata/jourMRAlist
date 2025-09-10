const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = 3000;

let browser; // simpan instance browser global

(async () => {
  browser = await puppeteer.launch({ 
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });
  console.log("🚀 Puppeteer browser started");
})();

// ✅ Middleware untuk CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.get("/screenshot", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing URL");

  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport({
      width: 1920,
      height: 800,
      deviceScaleFactor: 2,
    });

    // Masuk ke halaman
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    console.log(`✅ Loaded: ${url}`);

    // Klik toast opsional
    try {
      await page.waitForSelector(".euiToast__closeButton", { timeout: 5000 });
      await page.click(".euiToast__closeButton");
      console.log("✅ Toast close button clicked");
    } catch (err) {
      console.log("⚠️ Toast close button not found, lanjut...");
    }

    // Klik dismiss alert opsional
    try {
      await page.waitForSelector('[data-test-subj="dismissAlertButton"]', { timeout: 5000 });
      await page.click('[data-test-subj="dismissAlertButton"]');
      console.log("✅ Dismiss alert clicked");
    } catch (err) {
      console.log("⚠️ Dismiss alert not found, lanjut...");
    }

    // Delay safety
    await new Promise(r => setTimeout(r, 500));

    // Tunggu class utama
    await page.waitForSelector(".kbnDocViewer__value", { timeout: 30000 });
    console.log("✅ kbnDocViewer__value found");

    // Screenshot
    const buffer = await page.screenshot({ fullPage: true });
    await page.close();

    res.set("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error(`❌ Screenshot failed for ${url}:`, err);
    await page.close().catch(() => {}); // pastikan tab tertutup walau error
    res.status(500).send("Failed to capture screenshot");
  }
});


app.listen(port, () => {
  console.log(`🚀 Screenshot service running at http://localhost:${port}`);
});
