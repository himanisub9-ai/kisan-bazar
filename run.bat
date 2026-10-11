@echo off
title Kisan Bazar Launcher
cls

echo =====================================================================
echo                     Starting Kisan Bazar
echo =====================================================================
echo.

:: 1. Start FastAPI Backend
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
if exist "%~dp0backend\venv\Scripts\activate.bat" (
    start "Kisan Bazar - Backend (FastAPI)" /d "%~dp0backend" cmd /k "call venv\Scripts\activate.bat && python -m uvicorn app.main:app --reload --port 8000"
) else (
    start "Kisan Bazar - Backend (FastAPI)" /d "%~dp0backend" cmd /k "python -m uvicorn app.main:app --reload --port 8000"
)

:: 2. Start React Frontend (Vite)
echo [2/2] Starting React Frontend on http://localhost:5173 ...
if not exist "%~dp0frontend\node_modules" (
    start "Kisan Bazar - Frontend (React)" /d "%~dp0frontend" cmd /k "npm install && npm run dev"
) else (
    start "Kisan Bazar - Frontend (React)" /d "%~dp0frontend" cmd /k "npm run dev"
)

echo.
echo =====================================================================
echo  Kisan Bazar is launching!
echo.
echo  Backend API:       http://127.0.0.1:8000
echo  API Documentation: http://127.0.0.1:8000/docs
echo  Frontend App:      http://localhost:5173
echo.
echo  Both services are running in separate terminal windows.
echo  You can close this launcher window anytime without stopping them.
echo =====================================================================
echo.
pause
