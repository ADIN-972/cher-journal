@echo off
REM Start Cloudflare Tunnel for Cher Journal
REM This script runs the cloudflared tunnel with the configuration for moncherjournal.com

echo Starting Cloudflare Tunnel...
echo.

C:\cloudflared\cloudflared.exe tunnel --config C:\Users\yabon\.cloudflared\config.yml run moncherjournal

REM If we reach here, the tunnel has stopped
echo.
echo Cloudflare Tunnel has stopped.
pause
