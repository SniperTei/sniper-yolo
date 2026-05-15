# 🚀 快速开始指南

## 部署到火山引擎云服务器

### 第一步：连接服务器

```bash
ssh root@your-server-ip
```

### 第二步：安装 Docker（如果未安装）

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 第三步：选择部署目录并克隆代码

**推荐使用 /opt/services 目录**：

```bash
# 创建统一的服务目录
mkdir -p /opt/services
cd /opt/services

# 克隆前端代码（假设在 webapp 分支）
git clone -b webapp https://github.com/your-username/LearnVue.git webapp
cd webapp
```

### 第四步：配置环境变量

#### 配置测试环境

```bash
# 测试环境可以使用默认配置
# 如果需要修改 API 地址，编辑 .env.test
vim .env.test
```

#### 配置生产环境（重要！）

```bash
# 1. 复制示例配置
cp .env.prod.example .env.prod

# 2. 编辑配置文件
vim .env.prod
```

**必须修改的配置项**：
```bash
# .env.prod 文件中
VITE_APP_API_URL=https://your-api-domain.com
```

### 第五步：部署测试环境

```bash
# 1. 构建镜像
./deploy.sh test build

# 2. 启动服务
./deploy.sh test up

# 3. 查看状态
./deploy.sh test ps
```

### 第六步：验证测试环境

```bash
# 检查服务状态
./deploy.sh test ps

# 测试访问
curl http://localhost:3001/health

# 在浏览器访问
# http://your-server-ip:3001
```

### 第七步：部署生产环境（可选）

```bash
# 1. 确认已配置 .env.prod
cat .env.prod | grep VITE_APP_API_URL

# 2. 构建镜像
./deploy.sh prod build

# 3. 启动服务
./deploy.sh prod up

# 4. 配置 SSL（可选但强烈推荐）
# 需要手动配置 nginx SSL 证书
```

## 访问地址

| 环境 | 端口 | URL |
|------|------|-----|
| 测试 | 3001 | http://localhost:3001 |
| 生产 | 80 | http://localhost:80 |
| 生产 | 443 | https://localhost (需配置 SSL) |

## 常用命令

```bash
# 测试环境
./deploy.sh test logs      # 查看日志
./deploy.sh test restart   # 重启服务
./deploy.sh test ps        # 查看状态

# 生产环境
./deploy.sh prod logs      # 查看日志
./deploy.sh prod restart   # 重启服务
./deploy.sh prod ps        # 查看状态
```

## 与后端集成

### 确保前后端在同一网络

```bash
# 查看网络列表
docker network ls | grep sniper

# 前后端应该使用相同的网络
# sniper_test_network  (测试环境)
# sniper_prod_network  (生产环境)
```

**测试环境网络创建**：
```bash
# 如果网络不存在，创建测试网络
docker network create sniper_test_network

# 或者使用后端提供的启动脚本
cd /opt/services/sniper-yolo-backend
./start-services.sh  # 会自动创建网络
```

**生产环境网络创建**：
```bash
# 生产环境需要单独创建网络
docker network create sniper_prod_network
```

### 修改 API 地址

根据你的部署方式：

**方式一：前后端在同一服务器**
```bash
# .env.prod
VITE_APP_API_URL=https://your-domain.com
```

**方式二：前后端分离部署**
```bash
# .env.prod
VITE_APP_API_URL=https://api.your-domain.com
```

## 重要提醒

### 部署前必做

1. **修改 .env.prod API 地址**
   ```bash
   vim .env.prod
   # 修改 VITE_APP_API_URL 为实际的后端地址
   ```

2. **配置防火墙**
   ```
   火山引擎安全组：
   - SSH: 22
   - HTTP: 80
   - HTTPS: 443
   - 测试端口: 3001 (可选)
   ```

3. **创建 Docker 网络**
   ```bash
   docker network create sniper_network_test
   docker network create sniper_network_prod
   ```

### 安全建议

- ✅ 生产环境使用 HTTPS
- ✅ 配置 CORS 白名单
- ✅ 定期更新依赖
- ✅ 启用 nginx 访问日志

## 日常更新流程

### 方式一：在服务器上手动更新

```bash
# 在服务器上执行
cd /opt/services/webapp
git pull origin webapp

# 重新构建并部署
./deploy.sh test rebuild
```

### 方式二：使用本地脚本

**配置环境变量**：
```bash
export DEPLOY_SERVER=root@your-server-ip
export DEPLOY_PATH=/opt/services/webapp
export DEPLOY_ENV=test
```

**部署**：
```bash
git push origin webapp
ssh $DEPLOY_SERVER "cd $DEPLOY_PATH && git pull && ./deploy.sh $DEPLOY_ENV rebuild"
```

## 需要帮助？

- 📖 完整文档: `cat DEPLOYMENT.md`
- 🐛 问题排查: 查看 DEPLOYMENT.md 中的故障排查章节

---

**环境配置**:
- 测试环境: 用于开发测试，端口 3001
- 生产环境: 用于线上服务，端口 80/443

**端口说明**:
- 生产环境使用标准端口 (80/443)
- 测试环境使用 3001 避免冲突
