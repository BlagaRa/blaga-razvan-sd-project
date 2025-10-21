@echo off
echo =====================================================
echo 🚀  Starting production deployment for microservices
echo =====================================================

REM Oprește containerele vechi
echo Stopping old containers...
docker compose -f docker-compose.prod.yml down

REM Curăță cache-ul (opțional)
echo Removing old images...
docker system prune -af

REM Construiește din nou imaginile
echo Building new Docker images...
docker compose -f docker-compose.prod.yml build --no-cache

REM Pornește containerele în fundal
echo Starting all services...
docker compose -f docker-compose.prod.yml up -d

REM Verifică statusul containerelor
echo Checking running containers...
docker ps

echo =====================================================
echo ✅ Deployment finished successfully!
echo =====================================================

pause
