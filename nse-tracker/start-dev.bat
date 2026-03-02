@echo off
echo Starting NSE Intelligence Tracker Development Environment...
echo.

echo Step 1: Starting PostgreSQL...
docker run --name nse-postgres -e POSTGRES_PASSWORD=nse_tracker_2024 -e POSTGRES_USER=nse_tracker -e POSTGRES_DB=nse_tracker -p 5432:5432 -d postgres:15-alpine
timeout /t 10

echo Step 2: Starting Redis...
docker run --name nse-redis -p 6379:6379 -d redis:7-alpine
timeout /t 5

echo Step 3: Starting Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
set DATABASE_URL=postgresql://nse_tracker:nse_tracker_2024@localhost:5432/nse_tracker
set REDIS_URL=redis://localhost:6379/0
set JWT_SECRET=dev_jwt_secret_key_2024
set NEWSAPI_KEY=your_newsapi_key_here
set ALPHAVANTAGE_KEY=your_alphavantage_key_here
start /B uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo Step 4: Starting Frontend...
cd ../frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
)
set VITE_API_URL=http://localhost:8000
start /B npm run dev

echo.
echo NSE Intelligence Tracker is starting up...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop all services
pause
