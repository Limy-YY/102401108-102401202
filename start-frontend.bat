@echo off
chcp 65001 >nul
set "NODE_HOME=C:\Users\Administrator\AppData\Local\DoubaoWork\User Data\sandbox_runtime\bases\c98c5042338ed152c6f10ecd8591889f\node"
set "PATH=%NODE_HOME%;%PATH%"
cd /d E:\Codeproject\102401108-102401202
echo 正在启动前端（首次会编译稍慢）...
npm run dev:h5
pause
