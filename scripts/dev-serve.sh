#!/usr/bin/env bash
# دورة موثوقة: اقتل كل الخوادم، ابنِ نظيفاً، شغّل، وتحقق أن كل قطعة مُشار إليها موجودة.
set -e
PORT="${1:-3200}"
pkill -9 -f "next-server" 2>/dev/null || true
pkill -9 -f "next start"  2>/dev/null || true
pkill -9 -f "npm exec next" 2>/dev/null || true
sleep 2
rm -rf .next
npm run build > /tmp/build.log 2>&1 || { tail -20 /tmp/build.log; exit 1; }
setsid nohup npx next start -p "$PORT" > /tmp/srv.log 2>&1 < /dev/null &
disown 2>/dev/null || true
for i in $(seq 1 20); do
  sleep 1
  curl -s -m 3 -o /tmp/pg.html "http://localhost:$PORT/" && break
done
missing=0
for f in $(grep -o 'chunks/[a-z0-9_-]*\.\(css\|js\)' /tmp/pg.html | sort -u); do
  [ -f ".next/static/$f" ] || { echo "✗ chunk مفقود: $f"; missing=1; }
done
[ "$missing" = 0 ] && echo "✓ الخادم يعمل على $PORT وكل القطع سليمة"
