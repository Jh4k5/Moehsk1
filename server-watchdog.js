#!/usr/bin/env node
// Server watchdog - keeps Next.js alive
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG = '/tmp/next-watchdog.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG, line);
  process.stdout.write(line);
}

function startServer() {
  log('Starting Next.js server on port 3000...');
  const child = spawn('npx', ['next', 'dev', '--port', '3000'], {
    cwd: '/home/z/my-project',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PATH: process.env.PATH },
  });

  child.stdout.on('data', (data) => {
    const str = data.toString().trim();
    if (str) log(`[stdout] ${str}`);
  });

  child.stderr.on('data', (data) => {
    const str = data.toString().trim();
    if (str) log(`[stderr] ${str}`);
  });

  child.on('exit', (code, signal) => {
    log(`Server exited (code=${code}, signal=${signal}). Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });

  child.on('error', (err) => {
    log(`Server error: ${err.message}. Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });
}

log('Watchdog started');
startServer();
