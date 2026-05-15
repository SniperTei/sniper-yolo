# 📦 前端部署配置完成总结

## ✅ 已创建的文件

### Docker 配置
- ✅ `Dockerfile` - 多阶段构建配置（Node.js 构建 + Nginx 服务）
- ✅ `docker-compose.test.yml` - 测试环境配置（端口 3001）
- ✅ `docker-compose.prod.yml` - 生产环境配置（端口 80/443）

### Nginx 配置
- ✅ `nginx.conf` - Nginx 反向代理和静态文件服务配置

### 环境变量
- ✅ `.env.test` - 测试环境变量
- ✅ `.env.prod` - 生产环境变量（需修改 API 地址）
- ✅ `.env.prod.example` - 生产环境配置模板

### 脚本和工具
- ✅ `deploy.sh` - 一键部署脚本（支持 test/prod）
- ✅ `git-deploy.sh` - Git 工作流部署脚本

### 文档
- ✅ `QUICKSTART.md` - 快速开始指南
- ✅ `DEPLOYMENT.md` - 完整部署文档

### 其他
- ✅ `.dockerignore` - Docker 构建忽略文件
- ✅ `.gitignore` - 更新了 Git 忽略规则

## 🎯 环境对比

| 项目 | 测试环境 | 生产环境 |
|------|---------|---------|
| **用途** | 开发测试 | 线上服务 |
| **Web 端口** | 3001 | 80/443 |
| **网络** | sniper_test_network | sniper_prod_network |
| **资源限制** | 无 | 1 CPU / 512M RAM |
| **重启策略** | unless-stopped | always |

## 🔄 代码更新和部署

### 推荐工作流程：Git 方式

**首次部署**：
```bash
# 在服务器上
cd /opt/services
git clone -b webapp https://github.com/your-username/LearnVue.git webapp
cd webapp

# 创建网络
docker network create sniper_network_test
docker network create sniper_network_prod

# 配置环境
cp .env.prod.example .env.prod
vim .env.prod  # 修改 API 地址

# 部署
./deploy.sh test build
./deploy.sh test up
```

**日常更新**：
```bash
# 本地
git add .
git commit -m "feat: 新功能"
git push origin webapp

# 使用一键脚本
export DEPLOY_SERVER=root@your-server-ip
export DEPLOY_ENV=test
./git-deploy.sh
```

## 🚀 快速部署

### 测试环境
```bash
./deploy.sh test build
./deploy.sh test up
./deploy.sh test ps
```

访问：`http://your-server-ip:3001`

### 生产环境
```bash
# 1. 配置环境变量
vim .env.prod  # 修改 API 地址

# 2. 部署
./deploy.sh prod build
./deploy.sh prod up

# 3. 验证
./deploy.sh prod ps
curl http://localhost/
```

访问：`http://your-server-ip`

## ⚠️ 重要提醒

### 部署前必做

1. **修改 .env.prod API 地址**
   ```bash
   vim .env.prod
   # 修改 VITE_APP_API_URL 为实际的后端地址
   ```

2. **确认后端网络已存在**
   ```bash
   # 测试环境
   docker network ls | grep sniper_test_network

   # 生产环境
   docker network ls | grep sniper_prod_network
   ```

3. **配置防火墙**
   ```
   火山引擎安全组：
   - SSH: 22
   - HTTP: 80
   - HTTPS: 443
   - 测试端口: 3001 (可选)
   ```

### 与后端集成

**确保前后端使用相同的 Docker 网络**：
```bash
# 查看网络
docker network ls | grep sniper

# 应该看到：
# sniper_test_network    (测试环境 - 前后端共享)
# sniper_prod_network    (生产环境 - 前后端共享)

# 前端会自动加入对应的网络
```

**API 地址配置**：
```env
# .env.prod
# 方式一：前后端同域
VITE_APP_API_URL=https://your-domain.com

# 方式二：前后端分离
VITE_APP_API_URL=https://api.your-domain.com
```

## 📊 架构对比

### 方式一：前后端同网络

```
Docker Network: sniper_network_test
├── sniper_webapp_test      (前端, Port 3001)
└── sniper_yolo_backend_test (后端, Port 8002)
```

优点：容器间直接通信，安全性高

### 方式二：前后端独立部署

```
前端: Port 80/443 (独立服务器或容器)
后端: Port 8000 (独立服务器或容器)
```

优点：解耦，灵活扩展

## 🛠️ 常用命令

```bash
# 查看状态
./deploy.sh test ps

# 查看日志
./deploy.sh test logs

# 重启服务
./deploy.sh test restart

# 重新构建
./deploy.sh test rebuild

# 停止服务
./deploy.sh test down
```

## 📝 部署检查清单

- [ ] 服务器已准备
- [ ] Docker 已安装
- [ ] 代码已上传
- [ ] 后端网络已确认
- [ ] .env.prod 已配置
- [ ] 防火墙已配置
- [ ] 测试环境已部署
- [ ] 生产环境已部署
- [ ] 域名已配置（可选）
- [ ] SSL 证书已配置（可选）

## 📖 相关文档

- 快速开始: `cat QUICKSTART.md`
- 完整文档: `cat DEPLOYMENT.md`

## 🎯 下一步

1. **部署到服务器**
   ```bash
   # 在服务器上
   cd /opt/services
   git clone -b webapp https://github.com/your-username/LearnVue.git webapp
   cd webapp
   ./deploy.sh test build && ./deploy.sh test up
   ```

2. **配置域名和 SSL**（可选）
   - 配置 DNS A 记录
   - 安装 SSL 证书（Let's Encrypt）
   - 更新 nginx 配置

3. **监控和日志**
   ```bash
   # 查看日志
   ./deploy.sh test logs

   # 设置日志轮转
   # 配置监控告警
   ```

---

**祝部署顺利！** 🚀
