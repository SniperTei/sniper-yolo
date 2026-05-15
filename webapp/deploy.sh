#!/bin/bash

# Sniper Webapp 部署脚本
# 支持测试环境和生产环境的一键部署

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        echo "安装命令: curl -fsSL https://get.docker.com | sh"
        exit 1
    fi
    print_info "Docker 已安装: $(docker --version)"
}

# 检查 Docker Compose 是否安装
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    if docker compose version &> /dev/null; then
        print_info "Docker Compose 已安装: $(docker compose version)"
        DOCKER_COMPOSE="docker compose"
    else
        print_info "Docker Compose 已安装: $(docker-compose --version)"
        DOCKER_COMPOSE="docker-compose"
    fi
}

# 显示使用说明
show_usage() {
    cat << EOF
╔═══════════════════════════════════════════════════════════════╗
║     Sniper Webapp 部署脚本 v1.0                               ║
╚═══════════════════════════════════════════════════════════════╝

使用方法:
    $0 [ENVIRONMENT] [COMMAND]

ENVIRONMENT:
    test    测试环境 (端口: 3001)
    prod    生产环境 (端口: 80/443)

COMMAND:
    build   构建 Docker 镜像
    up      启动所有服务
    down    停止所有服务
    restart 重启所有服务
    logs    查看服务日志 (实时)
    ps      查看服务运行状态
    clean   清理容器和数据（危险操作）
    rebuild 重新构建并启动

示例:
    $0 test build      # 构建测试环境镜像
    $0 prod up         # 启动生产环境
    $0 test logs       # 查看测试环境日志
    $0 test rebuild    # 重新构建并启动

文档:
    快速开始: cat QUICKSTART.md
    完整文档: cat DEPLOYMENT.md

EOF
}

# 获取 compose 文件
get_compose_file() {
    local env=$1
    case $env in
        test)
            echo "docker-compose.test.yml"
            ;;
        prod)
            echo "docker-compose.prod.yml"
            ;;
        *)
            print_error "未知的环境: $env (支持: test, prod)"
            exit 1
            ;;
    esac
}

# 获取环境端口
get_env_port() {
    local env=$1
    case $env in
        test)
            echo "3001"
            ;;
        prod)
            echo "80"
            ;;
    esac
}

# 获取网络名称
get_network_name() {
    local env=$1
    case $env in
        test)
            echo "sniper_test_network"
            ;;
        prod)
            echo "sniper_prod_network"
            ;;
    esac
}

# 构建镜像
build_image() {
    local env=$1
    local compose_file=$(get_compose_file $env)
    local port=$(get_env_port $env)

    print_step "构建 $env 环境镜像..."

    $DOCKER_COMPOSE -f $compose_file build --no-cache

    print_info "✅ 构建完成！"
    print_info "访问地址: http://localhost:$port"
}

# 启动服务
start_services() {
    local env=$1
    local compose_file=$(get_compose_file $env)
    local port=$(get_env_port $env)
    local network_name=$(get_network_name $env)

    print_step "启动 $env 环境服务..."

    # 检查网络是否存在，不存在则创建
    if ! docker network ls | grep -q "$network_name"; then
        print_warning "网络 $network_name 不存在，正在创建..."
        docker network create "$network_name"
        print_info "✅ 网络 $network_name 已创建"
    else
        print_info "✅ 网络 $network_name 已存在"
    fi

    # 启动服务
    $DOCKER_COMPOSE -f $compose_file up -d

    print_info "⏳ 等待服务启动..."
    sleep 10

    # 检查服务状态
    if $DOCKER_COMPOSE -f $compose_file ps | grep -q "Exit"; then
        print_error "服务启动失败，请查看日志"
        $DOCKER_COMPOSE -f $compose_file logs --tail=50
        exit 1
    fi

    print_info "✅ $env 环境服务已启动！"
    print_info "访问地址: http://localhost:$port"
}

# 停止服务
stop_services() {
    local env=$1
    local compose_file=$(get_compose_file $env)

    print_step "停止 $env 环境服务..."
    $DOCKER_COMPOSE -f $compose_file down

    print_info "✅ $env 环境服务已停止！"
}

# 重启服务
restart_services() {
    local env=$1
    print_step "重启 $env 环境服务..."
    stop_services $env
    start_services $env
}

# 查看日志
view_logs() {
    local env=$1
    local compose_file=$(get_compose_file $env)

    print_info "查看 $env 环境日志 (Ctrl+C 退出)..."
    $DOCKER_COMPOSE -f $compose_file logs -f
}

# 查看运行状态
show_status() {
    local env=$1
    local compose_file=$(get_compose_file $env)

    print_step "$env 环境运行状态:"
    echo ""
    $DOCKER_COMPOSE -f $compose_file ps
    echo ""

    # 显示健康检查
    local port=$(get_env_port $env)
    print_info "执行健康检查..."
    if curl -s http://localhost:$port/health > /dev/null; then
        print_info "✅ Web 服务正常"
    else
        print_warning "⚠️  Web 服务可能未就绪"
    fi
}

# 清理环境
clean_environment() {
    local env=$1
    local compose_file=$(get_compose_file $env)

    print_warning "⚠️  警告：此操作将删除 $env 环境的所有容器！"
    read -p "确定要继续吗？请输入 'yes' 确认: " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "操作已取消"
        exit 0
    fi

    print_step "清理 $env 环境..."
    $DOCKER_COMPOSE -f $compose_file down -v

    print_info "✅ $env 环境清理完成！"
}

# 重新构建并启动
rebuild_and_start() {
    local env=$1
    print_step "重新构建并启动 $env 环境..."
    build_image $env
    start_services $env
}

# 显示环境信息
show_env_info() {
    local env=$1
    local port=$(get_env_port $env)

    cat << EOF

╔═══════════════════════════════════════════════════════════════╗
║              $env 环境信息                                    ║
╠═══════════════════════════════════════════════════════════════╣
║  Web 地址:     http://localhost:$port                         ║
║  健康检查:     http://localhost:$port/health                  ║
╠═══════════════════════════════════════════════════════════════╣
║  常用命令:                                                  ║
║    查看日志:   $0 $env logs                                 ║
║    重启服务:   $0 $env restart                               ║
║    重新构建:   $0 $env rebuild                               ║
╚═══════════════════════════════════════════════════════════════╝

EOF
}

# 主函数
main() {
    if [ $# -lt 2 ]; then
        show_usage
        exit 1
    fi

    local env=$1
    local command=$2

    # 检查环境参数
    if [ "$env" != "test" ] && [ "$env" != "prod" ]; then
        print_error "无效的环境参数: $env (支持: test, prod)"
        show_usage
        exit 1
    fi

    # 检查 Docker
    check_docker
    check_docker_compose

    # 执行命令
    case $command in
        build)
            build_image $env
            show_env_info $env
            ;;
        up)
            start_services $env
            show_env_info $env
            ;;
        down)
            stop_services $env
            ;;
        restart)
            restart_services $env
            show_env_info $env
            ;;
        logs)
            view_logs $env
            ;;
        ps)
            show_status $env
            ;;
        clean)
            clean_environment $env
            ;;
        rebuild)
            rebuild_and_start $env
            show_env_info $env
            ;;
        *)
            print_error "未知命令: $command"
            show_usage
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
