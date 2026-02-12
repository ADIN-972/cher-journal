@echo off
echo ================================================
echo  Cher Journal - Cloudflare Tunnels
echo ================================================
echo.
echo Ce script va demarrer 3 tunnels Cloudflare :
echo  - Backend (port 3000)
echo  - Web App (port 5173)
echo  - Admin App (port 5174)
echo.
echo IMPORTANT: Gardez cette fenetre ouverte !
echo Les URLs changeront si vous relancez ce script.
echo.
pause

echo.
echo [1/3] Demarrage du tunnel Backend (port 3000)...
start "Backend Tunnel" cmd /k "C:\cloudflared\cloudflared.exe tunnel --url http://localhost:3000"
timeout /t 3 >nul

echo [2/3] Demarrage du tunnel Web App (port 5173)...
start "Web App Tunnel" cmd /k "C:\cloudflared\cloudflared.exe tunnel --url http://localhost:5173"
timeout /t 3 >nul

echo [3/3] Demarrage du tunnel Admin App (port 5174)...
start "Admin App Tunnel" cmd /k "C:\cloudflared\cloudflared.exe tunnel --url http://localhost:5174"
timeout /t 3 >nul

echo.
echo ================================================
echo  Tunnels demarres !
echo ================================================
echo.
echo Consultez les 3 fenetres ouvertes pour voir les URLs.
echo.
echo Pour arreter les tunnels : Fermez les 3 fenetres CMD
echo.
echo NEXT STEPS:
echo 1. Notez les 3 URLs (format: https://xxx.trycloudflare.com)
echo 2. Ajoutez les URLs Web et Admin dans apps/backend/.env (CORS_ORIGINS)
echo 3. Modifiez les proxies dans apps/web/vite.config.ts et apps/admin/vite.config.ts
echo 4. Redemarrez backend, web et admin
echo.
pause
