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
    const title =
      document.querySelector("title")?.innerText ||
      document.querySelector("h1")?.innerText ||
      "";

    const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
      .map((el) => el.innerText.trim())
      .filter(Boolean);

    const links = Array.from(document.querySelectorAll("a"))
      .filter((a) => a.href && !a.href.startsWith("#"))
      .map((a) => ({
        text: a.innerText.trim(),
        href: a.href,
      }));

    const main =
      document.querySelector("main") ||
      document.querySelector("article") ||
      document.body;

    return {
      title,
      headings,
      links,
      main_content: main.innerText || "",
    };
  });

  console.log(JSON.stringify(data, null, 2));

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
