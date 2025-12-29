@echo off
echo Starting Tunnel...
echo ---------------------------------------------------
echo NOTE: If you are asked to continue connecting, type "yes".
echo ---------------------------------------------------
echo.
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:8000 serveo.net > tunnel_log.txt 2>&1
