@echo off
echo ========================================
echo My-Day Network Server 启动脚本
echo ========================================

REM 检查环境变量文件
if not exist .env (
    echo 请先复制 env.example 为 .env 并配置相关参数
    copy env.example .env
    echo 已创建 .env 文件，请编辑配置参数后重新运行
    pause
    exit /b 1
)

REM 安装依赖
echo 安装依赖...
call npm install

REM 启动服务器
echo 启动网络服务器...
call npm run dev

pause 