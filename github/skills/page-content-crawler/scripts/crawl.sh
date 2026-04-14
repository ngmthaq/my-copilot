#!/bin/bash

URL="$1"

if [ -z "$URL" ]; then
  echo '{"error":"URL is required"}'
  exit 1
fi

echo "[INFO] Crawling: $URL" >&2

# 1. Node crawler
if command -v node >/dev/null 2>&1; then
  if node scripts/node-crawler.cjs "$URL" > /tmp/crawl.json 2>/dev/null; then
    echo '{"source_mode":"node"}'
    cat /tmp/crawl.json
    exit 0
  fi
fi

echo "[WARN] Node failed" >&2

# 2. Python crawler
if command -v python3 >/dev/null 2>&1; then
  if python3 scripts/python-crawler.py "$URL" > /tmp/crawl.json 2>/dev/null; then
    echo '{"source_mode":"python"}'
    cat /tmp/crawl.json
    exit 0
  fi
fi

echo "[WARN] Python failed" >&2

# 3. Chrome fallback
CHROME_BIN=""

if command -v google-chrome >/dev/null 2>&1; then
  CHROME_BIN="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_BIN="chromium"
fi

if [ ! -z "$CHROME_BIN" ]; then
  if $CHROME_BIN --headless --disable-gpu --no-sandbox --dump-dom "$URL" > /tmp/raw.html 2>/dev/null; then
    echo '{"source_mode":"chrome","content_file":"/tmp/raw.html"}'
    exit 0
  fi
fi

echo "[WARN] Chrome failed" >&2

# 4. curl fallback
if command -v curl >/dev/null 2>&1; then
  if curl -s "$URL" > /tmp/raw.html; then
    echo '{"source_mode":"curl","content_file":"/tmp/raw.html"}'
    exit 0
  fi
fi

echo '{"fallback":true,"source_mode":"fallback"}'
exit 0