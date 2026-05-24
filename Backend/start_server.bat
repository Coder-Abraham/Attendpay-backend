@echo off
echo Starting AttendPay Django Backend...
echo API will be available at http://127.0.0.1:8000/api/
echo.
echo For physical device testing, use your local IP instead:
echo   python manage.py runserver 0.0.0.0:8000
echo.
python manage.py runserver 0.0.0.0:8000
