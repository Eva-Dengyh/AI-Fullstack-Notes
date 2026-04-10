# 5 分钟用 Docker 自建 Supabase

Supabase 是一个开源的 Firebase 替代品，提供数据库、认证、存储、边缘函数等功能。官方提供 Docker 部署方案，几分钟就能在本地跑起来。

---

## 1. 安装 Docker Desktop

如果没有 Docker Desktop，先去下载：

👉 https://www.docker.com/products/docker-desktop

安装完成后确保 Docker 正常运行。

## 2. 克隆 Supabase 仓库

```bash
git clone https://github.com/supabase/supabase.git
cd supabase/docker
```

复制配置文件：

```bash
cp .env.example .env
```

## 3. 配置管理后台

用 vim 或你熟悉的编辑器打开 `.env`，找到 `Access to Dashboard` 部分：

```env
DASHBOARD_USERNAME=username
DASHBOARD_PASSWORD=pwd
```

改成你自己的用户名和密码。

## 4. 启动服务

```bash
docker compose up -d
```

第一次启动会拉取镜像，需要等待几分钟。

## 5. 访问 Supabase

启动完成后：

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:8000 |
| API | http://localhost:8000/rest/v1/ |
| Studio | http://localhost:8000/studio/ |

用刚才配置的账号密码登录管理后台。

## 6. 玩转 Supabase

自建版本可以做什么：

- 📊 **PostgreSQL 数据库** — 完全的 PostgreSQL 权限
- 🔐 **用户认证** — 内置邮箱、社交登录
- 📁 **文件存储** — 对象存储服务
- ⚡️ **边缘函数** — Deno / Edge Functions
- 📡 **实时订阅** — Realtime 数据同步

## 7. 外网访问（进阶）

自建的 Supabase 默认只能在本地访问，如果想从外网也能访问，可以搭建内网穿透：

- 可以用 Cloudflare Tunnel、frp、cpolar 等工具
- 把本地端口 `8000` 映射到公网
- 就可以在任何地方访问你的 Supabase 服务

---

## 常用命令

**停止服务**

```bash
docker compose down
```

**重启服务**

```bash
docker compose restart
```

**查看日志**

```bash
docker compose logs -f
```

---

## 适用场景

- ✅ 本地开发测试
- ✅ 私有化部署
- ✅ 学习研究
- ⚠️ 生产环境不推荐（官方建议用云服务）
