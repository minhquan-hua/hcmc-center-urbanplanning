@echo off
rem Bam dup file nay de dua cac thay doi len website cong khai.
cd /d "%~dp0"
chcp 65001 >nul
echo Buoc 1: kiem tra du lieu...
py scripts\cap_nhat.py
if errorlevel 1 (
  echo.
  echo DU LIEU CON LOI nen chua dua len mang. Hay sua loi o tren roi chay lai.
  pause
  exit /b 1
)
echo.
echo Buoc 2: luu thay doi va dua len GitHub...
git add -A
git commit -m "Cap nhat noi dung"
git push
if errorlevel 1 (
  echo.
  echo CHUA DUA LEN DUOC. Kiem tra mang, hoac dang nhap GitHub khi cua so hien ra, roi chay lai.
  pause
  exit /b 1
)
echo.
echo XONG. Website se cap nhat sau khoang 1-2 phut.
pause
