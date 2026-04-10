# Docker 教程 — Docker Compose vs Docker Swarm

## 1. Docker Compose 与 Docker Swarm

### 1.1 基本概念与定位

**Docker Compose** 是一个用于定义和运行多容器 Docker 应用的工具，通过 YAML 配置文件来管理应用服务的编排。它主要面向单主机环境，特别适合本地开发和小规模部署场景。

**Docker Swarm** 是 Docker 的原生容器编排平台，能够将多个 Docker 主机组成集群，提供跨节点的容器调度、负载均衡和高可用性功能。它旨在简化生产环境中的容器编排复杂性。

### 1.2 技术架构差异

| 特性 | Docker Compose | Docker Swarm |
|------|---------------|--------------|
| 部署范围 | 单主机部署 | 多主机集群 |
| 配置方式 | 基于单一 YAML 文件配置 | 集群配置和服务定义 |
| 启动命令 | `docker-compose up` | `docker service create/update` |
| 网络通信 | 依赖主机级端口映射和容器链接 | 内置 overlay 网络和服务发现 |
| 扩展能力 | 手动扩展 | 自动化扩展和负载均衡 |
| 节点管理 | 无节点概念 | Manager 节点负责任务调度和集群管理 |
| 工作负载 | 直接运行容器 | Worker 节点执行容器工作负载 |
| 高可用性 | 无内置高可用 | 内置高可用和故障恢复 |
| 一致性算法 | 无 | 使用 Raft 一致性算法确保集群状态 |
| 更新机制 | 重新启动容器 | 支持 rolling updates 和 service scaling |
| 适用场景 | 快速原型开发和本地测试 | 生产环境和大规模部署 |

---

## 2. 个人项目部署场景

**推荐使用 Docker Compose**

对于个人项目，推荐使用 Docker Compose，因为它在资源消耗、维护成本和学习门槛方面都更加友好——通过单一 YAML 文件即可管理整个应用栈，几分钟内完成部署，无需专业的 DevOps 技能，系统资源占用少，完全能够满足个人项目的小规模负载需求，是性价比最高的容器编排解决方案。

---

## 3. 个人项目 Docker 部署架构设计

### 3.1 配置文件解析 — `docker-compose.yml` 关键配置

```yaml
version: '3.8'
services:
  backend:
    image: registry.example.com/my-app/backend:latest
    container_name: my-app-backend
    ports:
      - "8000:8000"
    environment:
      # 环境配置集中管理
      - PYTHONUNBUFFERED=1
      - PYTHONWARNINGS=ignore::DeprecationWarning
      - LOG_LEVEL=INFO
      - APP_ENV=prod
      # 数据库配置
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      # JWT配置
      - SECRET_KEY=${SECRET_KEY}
      # 第三方服务配置
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://api.openai.com/v1}
      # 启用定时任务
      - ENABLE_SCHEDULED_JOBS=true
    volumes:
      # 数据持久化
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    command: python run_server.py
    restart: always
    deploy:
      restart_policy:
        condition: on-failure
        delay: 60s
    networks:
      - app-network

  frontend:
    image: registry.example.com/my-app/frontend:latest
    container_name: my-app-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=http://backend:8000  # 服务间通信
      - REACT_APP_TITLE=我的个人项目
    depends_on:
      - backend  # 服务依赖管理
    restart: always
    deploy:
      restart_policy:
        condition: on-failure
        delay: 60s
    networks:
      - app-network

networks:
  app-network:
    driver: bridge  # 内部网络隔离
```

### 3.2 脚本梳理详解

- **`docker-compose.yml`** — 定义服务编排的核心文件，包含：
  - `builder` 阶段：安装依赖（使用 `uv` 包管理器），构建虚拟环境
  - `runner` 阶段：复制代码和虚拟环境，构建最终运行镜像，设置环境变量并启动主程序

- **`Dockerfile.base`** — 构建基础镜像的配置文件：
  - 基于可配置的基础镜像（镜像地址、名称、标签）构建后端应用镜像
  - 复制项目代码到容器中
  - 设置容器启动时运行指定脚本

- **`Dockerfile`** — 构建最终镜像，设计两个主要服务：
  - `backend` 服务：包含 API 服务和定时任务（jobs 已集成在主应用中）
  - `frontend` 服务：React 前端应用

### 3.3 执行顺序

**开发或部署前首次使用时：**

1. 执行 `Dockerfile.base` 构建基础镜像
2. 执行 `Dockerfile` 构建应用镜像
3. 执行 `docker-compose.yml` 启动服务

**已经有镜像时：**

- 只需要执行 `docker-compose.yml`，它会自动拉取镜像并运行容器
