@echo off
chcp 65001 >nul
set "NODE_HOME=C:\Users\Administrator\AppData\Local\DoubaoWork\User Data\sandbox_runtime\bases\c98c5042338ed152c6f10ecd8591889f\node"
set "PATH=%NODE_HOME%;%PATH%"
cd /d E:\Codeproject\102401108-102401202\server
echo 正在启动后端服务...
node server.js
pause
