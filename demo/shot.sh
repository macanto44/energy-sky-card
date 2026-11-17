#!/bin/sh
# Screenshot the local demo with headless Chrome: demo/shot.sh <out.png> [query]
# Run `npm run build` first. Example: demo/shot.sh /tmp/night.png "s=nuit,bleu"
cd "$(dirname "$0")/.."
OUT="${1:-demo.png}"
QUERY="${2:-}"
exec "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=2 \
  --window-size=${WINW:-720},1150 --virtual-time-budget=4000 \
  --screenshot="$OUT" "file://$PWD/demo/index.html?$QUERY" 2>/dev/null
