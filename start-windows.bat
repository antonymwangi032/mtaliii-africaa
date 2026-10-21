@echo off
cd /d "%~dp0"
if not exist "node_modules" call npm install
if not exist ".env" (
 echo Create .env from .env.example and enter your own admin email and password.
 pause
 exit /b 1
)
for /f "usebackq tokens=1,* delims==" %%a in (".env") do if not "%%a"=="" if not "%%a:~0,1"=="#" set "%%a=%%b"
npm start
pause
