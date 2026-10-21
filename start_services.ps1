# CodeAlpha Credit Scoring Model - Service Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🚀 Launching CodeAlpha Credit Scoring Model Services..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

# 1. Start FastAPI ML Service (Port 8000)
Write-Host "`n[1/3] Starting FastAPI ML Microservice on http://127.0.0.1:8000..." -ForegroundColor Green
$mlProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\ml-service'; `$env:PYTHONIOENCODING='utf-8'; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# Wait 2 seconds
Start-Sleep -Seconds 2

# 2. Start NestJS Backend Gateway (Port 3001)
Write-Host "[2/3] Starting NestJS Backend Gateway on http://localhost:3001..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend-gateway'; npm start" -PassThru

# Wait 2 seconds
Start-Sleep -Seconds 2

# 3. Start Next.js Frontend (Port 3000)
Write-Host "[3/3] Starting Next.js Modern Frontend on http://localhost:3000..." -ForegroundColor Green
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev" -PassThru

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✨ All 3 tiers initiated successfully!" -ForegroundColor Green
Write-Host "   - Frontend UI:       http://localhost:3000" -ForegroundColor White
Write-Host "   - NestJS Gateway:    http://localhost:3001" -ForegroundColor White
Write-Host "   - FastAPI ML Docs:   http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan

