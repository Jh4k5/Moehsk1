#!/bin/bash
cd /home/z/my-project
rm -rf .next
while true; do
  npx next dev -p 3000 >> /home/z/my-project/dev.log 2>&1
  echo "Server crashed, restarting in 3 seconds..." >> /home/z/my-project/dev.log
  sleep 3
done
