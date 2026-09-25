@echo off
cd /d "%~dp0\.."
backend\.venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000
