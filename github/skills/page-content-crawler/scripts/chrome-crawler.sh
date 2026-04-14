#!/bin/bash

URL="$1"

if [ -z "$URL" ]; then
  echo "URL required"
  exit 1
fi

CHROME_BIN=""

if command -v google-chrome >/dev/null 2>&1; then
  CHROME_BIN="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_BIN="chromium"
fi

if [ -z "$CHROME_BIN" ]; then
  echo "Chrome not found"
  exit 1
fi

$CHROME_BIN \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --dump-dom \
  "$URL"