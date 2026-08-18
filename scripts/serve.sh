#!/usr/bin/env bash
# بناء ونشر محلي نظيف. الخوادم القديمة تخدم بناءً محفوظاً في ذاكرتها،
# فتظهر أعطال 500 على قطع لم تعد موجودة — لذلك نقتلها كلها أولاً.
set -euo pipefail
PORT="${1:-3200}"
pkill -9 -f 'next-server' 2>/dev/null || true
pkill -9 -f 'next start'  2>/dev/null || true
pkill -9 -f chromium      2>/dev/null || true
sleep 2
rm -rf .next
npm run build > /tmp/build.log 2>&1 || { echo "BUILD FAILED"; tail -20 /tmp/build.log; exit 1; }
setsid nohup npx next start -p "$PORT" > /tmp/srv.log 2>&1 < /dev/null &
sleep 8
code=$(curl -s -m 8 -o /dev/null -w '%{http_code}' "http://localhost:$PORT/")
missing=$(curl -s -m 8 "http://localhost:$PORT/" | grep -o 'chunks/[a-z0-9_-]*\.\(css\|js\)' | sort -u \
          | while read -r f; do [ -f ".next/static/$f" ] || echo "$f"; done)
echo "port=$PORT http=$code"
[ -z "$missing" ] && echo "✓ كل القطع مخدومة" || { echo "✗ قطع مفقودة:"; echo "$missing"; exit 1; }
