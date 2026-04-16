const { chromium } = require("playwright");

async function run() {
  const url = process.argv[2];

  if (!url) {
    console.error("URL required");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const data = await page.evaluate(() => {
    const title = document.head.querySelector("title");
    const description =
      document.head.querySelector('meta[name="description"]') ||
      document.head.querySelector('meta[property="description"]') ||
      document.head.querySelector('meta[name="og:description"]') ||
      document.head.querySelector('meta[property="og:description"]') ||
      document.head.querySelector('meta[name="twitter:description"]') ||
      document.head.querySelector('meta[property="twitter:description"]');

    const main = document.body.querySelector("main") || document.body;

    return {
      title: title?.innerText?.trim(),
      description: description?.getAttribute("content")?.trim(),
      main: main.innerText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n"),
    };
  });

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
