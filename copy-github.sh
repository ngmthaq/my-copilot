#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"
GITHUB_DIR="$SCRIPT_DIR/.github"

if [ ! -d "$GITHUB_DIR" ]; then
  echo "Error: .github folder not found in $SCRIPT_DIR"
  exit 1
fi

echo "Projects in $PARENT_DIR:"
echo ""

projects=()
i=1
for dir in "$PARENT_DIR"/*/; do
  dir_name="$(basename "$dir")"
  [ "$dir_name" = "$(basename "$SCRIPT_DIR")" ] && continue
  projects+=("$dir")
  echo "  $i) $dir_name"
  i=$((i + 1))
done

if [ ${#projects[@]} -eq 0 ]; then
  echo "No projects found."
  exit 1
fi

echo ""
read -p "Select project (1-${#projects[@]}): " choice

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt ${#projects[@]} ]; then
  echo "Invalid selection."
  exit 1
fi

target="${projects[$((choice - 1))]}"
target_name="$(basename "$target")"

if [ -d "$target/.github" ]; then
  read -p ".github already exists in $target_name. Overwrite? (y/n): " confirm
  if [ "$confirm" != "y" ]; then
    echo "Aborted."
    exit 0
  fi
  rm -rf "$target/.github"
fi

cp -r "$GITHUB_DIR" "$target/.github"
echo "Copied .github to $target_name"
