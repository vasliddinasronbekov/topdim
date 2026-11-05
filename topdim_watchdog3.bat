@echo off
:loop
tasklist /fi "imagename eq node.exe" | findstr /i "node.exe" >nul
if errorlevel 1 start /B C:\tools\node\node.exe C:\apps\topdim\backend\src\server.js
timeout /t 60 /nobreak
goto loop
