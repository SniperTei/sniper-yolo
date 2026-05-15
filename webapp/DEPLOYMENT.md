# 📦 Sniper Webapp 部署文档

完整的 Vue 3 前端应用部署指南，使用 Docker 容器化部署。

## 📋 目录

- [环境要求](#环境要求)
- [部署架构](#部署架构)
- [快速部署](#快速部署)
- [详细配置](#详细配置)
- [与后端集成](#与后端集成)
- [故障排查](#故障排查)
- [性能优化](#性能优化)

## 环境要求

### 服务器要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+ / CentOS 8+)
- **内存**: 至少 1GB RAM
- **磁盘**: 至少 5GB 可用空间
- **网络**: 开放 80, 443 端口

### 软件要求

- **Docker**: 20.10+
- **Docker Compose**: 2.0+ (可选)
- **Git**: 2.0+

## 部署架构

### 架构图

```
                        ┌─────────────────┐
                        │   用户浏览器      │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │   Nginx (前端)    │
                        │   Port 80/443    │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │  Vue 3 静态文件   │
                        │  Docker 容器      │
                        └────────┬─────────┘
                                 │
                        ┌────────▼─────────┐
                        │  后端 API (可选)  │
                        │  Port 8000/8002  │
                        └──────────────────┘
```

### 网络架构

```
Docker Network: sniper_network_test / sniper_network_prod
├── sniper_webapp_test/prod     (前端)
└── sniper_yolo_backend_test/prod (后端)
```

## 快速部署

### 1. 准备服务器

```bash
# 连接服务器
ssh root@your-server-ip

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 重新登录
exit
ssh root@your-server-ip
```

### 2. 克隆代码

```bash
# 创建目录
mkdir -p /opt/services
cd /opt/services

# 克隆代码
git clone -b webapp https://github.com/your-username/LearnVue.git webapp
cd webapp
```

### 3. 配置环境

```bash
# 复制生产环境配置
cp .env.prod.example .env.prod

# 编辑配置
vim .env.prod
```

配置项：
```env
NODE_ENV=production
VITE_APP_TITLE=Sniper Webapp
VITE_APP_API_URL=https://your-api-domain.com
```

### 4. 创建网络

```bash
# 创建 Docker 网络（与后端共享）
docker network create sniper_network_test
docker network create sniper_network_prod
```

### 5. 部署

```bash
# 测试环境
./deploy.sh test build
./deploy.sh test up

# 生产环境
./deploy.sh prod build
./deploy.sh prod up
```

## 详细配置

### Dockerfile 说明

多阶段构建：
1. **构建阶段**: 使用 Node.js 构建 Vue 应用
2. **生产阶段**: 使用 Nginx 提供静态文件服务

关键特性：
- ✅ 非 root 用户运行
- ✅ 健康检查
- ✅ 静态资源缓存
- ✅ Gzip 压缩

### Nginx 配置

主要功能：
- 静态文件服务
- API 代理（可选）
- Gzip 压缩
- 缓存策略
- 安全头

修改 nginx.conf 后需要重新构建：
```bash
./deploy.sh test rebuild
```

### 环境变量

| 变量 | 说明 | 示例 |
|------|------|------|
| `NODE_ENV` | 环境 | test/production |
| `VITE_APP_TITLE` | 应用标题 | Sniper Webapp |
| `VITE_APP_API_URL` | 后端 API 地址 | https://api.example.com |

## 与后端集成

### 方式一：同网络部署

前后端使用相同的 Docker 网络：

```yaml
# docker-compose.test.yml
networks:
  sniper_network_test:
    external: true
    name: sniper_network_test
```

优点：
- 容器间可以直接通信
- 安全性高
- 性能好

### 方式二：独立部署

前端独立部署，通过 API 地址访问后端：

```env
# .env.prod
VITE_APP_API_URL=https://api.your-domain.com
```

优点：
- 前后端解耦
- 可以分别部署到不同服务器
- 灵活性高

### API 代理配置

在 nginx.conf 中配置：

```nginx
location /api/ {
    proxy_pass http://backend:8000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## 故障排查

### 常见问题

#### 1. 容器启动失败

**问题**：容器无法启动

**排查**：
```bash
# 查看容器状态
docker ps -a

# 查看日志
./deploy.sh test logs

# 检查端口占用
netstat -tulpn | grep :3001
```

**解决**：
```bash
# 停止占用端口的进程
./deploy.sh test down

# 重新启动
./deploy.sh test up
```

#### 2. 页面空白

**问题**：访问页面显示空白

**排查**：
```bash
# 查看浏览器控制台错误
# 检查 API 是否可访问
curl https://your-api-domain.com/api/v1/health

# 查看 nginx 日志
docker logs sniper_webapp_test
```

**解决**：
- 检查 VITE_APP_API_URL 配置
- 检查后端服务是否正常
- 检查 CORS 配置

#### 3. API 请求失败

**问题**：API 请求 404 或跨域

**排查**：
```bash
# 检查后端服务
curl http://localhost:8002/api/v1/health

# 检查前端配置
cat .env.test | grep API_URL
```

**解决**：
- 确保 .env 中的 API_URL 正确
- 检查后端 CORS 配置
- 确保前后端在同一网络

#### 4. 构建失败

**问题**：Docker 构建失败

**排查**：
```bash
# 查看构建日志
./deploy.sh test build 2>&1 | tee build.log

# 检查 node_modules
docker run --rm -v $(pwd):/app node:18-alpine sh -c "cd /app && npm ci"
```

**解决**：
- 清理 Docker 缓存：`docker system prune -a`
- 检查 package.json 是否正确
- 确保 Dockerfile 路径正确

### 健康检查

```bash
# 检查容器健康状态
docker ps

# 手动健康检查
curl http://localhost:3001/health

# 查看容器资源使用
docker stats sniper_webapp_test
```

## 性能优化

### 1. 构建优化

```dockerfile
# 使用多阶段构建减小镜像体积
FROM node:18-alpine AS builder
# ... 构建步骤

FROM nginx:alpine
# ... 最终镜像
```

### 2. Nginx 优化

```nginx
# 启用 gzip
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json;

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 90d;
    add_header Cache-Control "public, immutable";
}
```

### 3. 镜像优化

```bash
# 使用 .dockerignore
echo "node_modules
.git
.env.*" > .dockerignore
```

### 4. 资源限制

```yaml
# docker-compose.prod.yml
deploy:
  resources:
    limits:
      cpus: '1'
      memory: 512M
```

## 监控和日志

### 查看日志

```bash
# 实时日志
./deploy.sh test logs

# 最近 100 行
docker logs --tail 100 sniper_webapp_test

# 持久化日志
docker run -v /var/log/nginx:/var/log/nginx ...
```

### 监控指标

```bash
# 容器资源使用
docker stats sniper_webapp_test

# 磁盘使用
docker system df

# 访问日志
docker exec sniper_webapp_test tail -f /var/log/nginx/access.log
```

## 备份和恢复

### 备份

```bash
# 备份配置文件
tar -czf webapp-config-$(date +%Y%m%d).tar.gz .env.* nginx.conf

# 备份构建镜像
docker save sniper-webapp:prod | gzip > webapp-image-$(date +%Y%m%d).tar.gz
```

### 恢复

```bash
# 恢复配置
tar -xzf webapp-config-20240208.tar.gz

# 恢复镜像
gunzip -c webapp-image-20240208.tar.gz | docker load
```

## 安全建议

### 1. 容器安全

- ✅ 使用非 root 用户运行
- ✅ 最小化镜像体积
- ✅ 定期更新基础镜像
- ✅ 扫描漏洞：`docker scout cves`

### 2. 网络安全

- ✅ 使用独立网络
- ✅ 限制容器间通信
- ✅ 配置防火墙规则

### 3. 应用安全

- ✅ 启用 HTTPS
- ✅ 配置安全头
- ✅ 限制请求频率
- ✅ 日志审计

## 持续集成

### Git 工作流

```bash
# 本地开发
git add .
git commit -m "feat: 新功能"
git push origin webapp

# 服务器更新
ssh root@server "cd /opt/services/webapp && git pull && ./deploy.sh test rebuild"
```

### 自动化脚本

创建 `deploy-to-server.sh`：
```bash
#!/bin/bash
SERVER="root@your-server-ip"
git push origin webapp
ssh $SERVER "cd /opt/services/webapp && git pull && ./deploy.sh test rebuild"
```

---

## 获取帮助

- 📖 快速开始: `cat QUICKSTART.md`
- 🐛 问题反馈: GitHub Issues
- 💬 讨论: GitHub Discussions

---

**祝你部署顺利！** 🚀
