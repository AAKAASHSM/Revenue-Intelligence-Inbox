@echo off
cd /d "%~dp0"
set "PATH=C:\Users\AAKAASH ARUN\.gemini\antigravity\scratch\node\node-v20.18.0-win-x64;%PATH%"
npm run dev -- --host 127.0.0.1 --port 5173
