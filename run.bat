@echo off
echo Starting Plant Disease Detection System...

echo Installing dependencies...
pip install -r requirements.txt

:: Start Backend
start "Backend API" cmd /k "uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend
start "Frontend App" cmd /k "cd frontend && npm run dev:lan"

echo Backend and Frontend are starting in separate windows.
