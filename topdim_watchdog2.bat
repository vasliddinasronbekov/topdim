@echo off
:loop
tasklist /fi "imagename eq node.exe" > C:\tools\node_check.txt 2>&1
findstr /i "node.exe" C:\tools\node_check.txt >nul 2>&1
if errorlevel 1 start /B C:\tools\node\node.exe C:\apps\topdim\backend\src\server.js
timeout /t 60 /nobreak >nul
goto loop
