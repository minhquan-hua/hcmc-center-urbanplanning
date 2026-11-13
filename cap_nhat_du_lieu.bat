@echo off
rem Bam dup file nay sau khi sua file trong thu muc data de xu ly lai du lieu.
cd /d "%~dp0"
chcp 65001 >nul
py scripts\cap_nhat.py
echo.
pause
