@echo off
echo ==========================================================
echo Starting Revenue Intelligence Inbox (Backend + Frontend)
echo ==========================================================

start "Revenue Intelligence Backend (Port 8000)" cmd /k "cd /d %~dp0 && backend\run_backend.bat"
timeout /t 3 /nobreak >nul
start "Revenue Intelligence Frontend (Port 5173)" cmd /k "cd /d %~dp0 && frontend\run_frontend.bat"

echo.
echo Application is starting:
echo Frontend: http://127.0.0.1:5173
echo Backend API Docs: http://127.0.0.1:8000/docs
echo.
pause
