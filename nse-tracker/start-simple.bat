@echo off
echo Starting NSE Intelligence Tracker (Simple Mode)...
echo.

echo Step 1: Starting Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
echo Installing dependencies...
pip install -r requirements.txt --quiet

echo Setting environment variables...
set DATABASE_URL=sqlite:///./nse_tracker.db
set REDIS_URL=redis://localhost:6379/0
set JWT_SECRET=dev_jwt_secret_key_2024
set NEWSAPI_KEY=demo_key
set ALPHAVANTAGE_KEY=demo_key
set APP_NAME=NSE Intelligence Tracker
set DEBUG=true
set LOG_LEVEL=INFO

echo Starting backend server...
start /B uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo Step 2: Starting Frontend...
cd ../frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install --silent
)
set VITE_API_URL=http://localhost:8000
echo Starting frontend development server...
start /B npm run dev

echo.
echo NSE Intelligence Tracker is starting up...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop all services
pause
