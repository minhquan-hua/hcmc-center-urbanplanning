@echo off
rem Bam dup file nay de xem website tren may. Dong cua so nay de tat.
cd /d "%~dp0"
echo Dang mo website tai http://localhost:8000
echo Giu cua so nay mo trong luc xem. Dong cua so de tat.
start "" http://localhost:8000
py -m http.server 8000
if errorlevel 1 (
  echo.
  echo Khong chay duoc. Co the Python chua duoc cai, hoac cong 8000 dang ban.
  pause
)
