#!/bin/bash

# Sniper Webapp - Git 部署脚本
# 使用 Git 工作流一键部署到服务器

set -e

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# 配置（请修改为你的实际配置）
SERVER="${DEPLOY_SERVER:-root@your-server-ip}"
REMOTE_PATH="${DEPLOY_PATH:-/opt/services/webapp}"
ENV="${DEPLOY_ENV:-test}"
BRANCH="${DEPLOY_BRANCH:-webapp}"

# 显示配置
echo ""
print_step "部署配置"
echo "  服务器: $SERVER"
echo "  环境:   $ENV (test/prod)"
echo "  分支:   $BRANCH"
echo "  路径:   $REMOTE_PATH"
echo ""

# 1. 推送到 Git
print_step "1. 推送代码到 Git ($BRANCH 分支)..."
git push origin $BRANCH
print_info "✅ Git 推送完成"

# 2. 在服务器上拉取并部署
print_step "2. 在服务器上拉取代码并部署..."
ssh $SERVER bash << EOF
set -e
echo ""
echo "📥 进入项目目录..."
cd $REMOTE_PATH

echo ""
echo "⬇️  拉取最新代码..."
git pull origin $BRANCH

echo ""
echo "🔨 重新构建镜像..."
./deploy.sh $ENV build

echo ""
echo "🚀 启动服务..."
./deploy.sh $ENV up

echo ""
echo "✅ 部署完成！"
EOF

print_info "✅ 全部完成！"

# 3. 显示下一步提示
echo ""
echo "📋 下一步操作："
echo "  查看日志:  ssh $SERVER 'cd $REMOTE_PATH && ./deploy.sh $ENV logs'"
echo "  查看状态:  ssh $SERVER 'cd $REMOTE_PATH && ./deploy.sh $ENV ps'"
echo "  测试访问:  curl http://your-server-ip:$([ "$ENV" = "prod" ] && echo "80" || echo "3001")"
echo ""
