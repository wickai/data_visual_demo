#!/bin/bash

# 库存数据可视化系统 Docker 部署脚本

echo "🚀 启动库存数据可视化系统..."

# 检查 Docker 和 Docker Compose 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 获取当前机器的公网IP
PUBLIC_IP=$(curl -s ifconfig.me)
if [ -z "$PUBLIC_IP" ]; then
    echo "⚠️  无法获取公网IP，使用默认配置"
    PUBLIC_IP="202.112.47.35"
fi

echo "🌐 检测到公网IP: $PUBLIC_IP"

# 设置环境变量
export VITE_API_BASE_URL="http://$PUBLIC_IP:8000"

# 停止可能正在运行的容器
echo "🛑 停止旧容器..."
docker-compose down

# 构建并启动服务
echo "🔨 构建和启动服务..."
docker-compose up --build -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

# 显示访问地址
echo ""
echo "✅ 部署完成！"
echo "🌍 前端访问地址: http://$PUBLIC_IP:5173"
echo "🔧 后端API地址: http://$PUBLIC_IP:8000"
echo "📚 API文档地址: http://$PUBLIC_IP:8000/docs"
echo ""
echo "🔍 查看日志命令:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "🛑 停止服务命令:"
echo "   docker-compose down"