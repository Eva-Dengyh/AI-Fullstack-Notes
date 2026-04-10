# AI-Fullstack-Notes

> 本仓库记录作为全栈工程师学习 AI/Agent 的完整过程，包含基础概念、框架源码分析、项目实战和精选资源。目标是打造可复用的知识体系，帮助更多开发者入门 AI 开发。

---

## 关于本仓库

这是一份持续更新的个人学习笔记，面向有一定工程基础、希望系统性进入 AI/Agent 开发领域的全栈工程师。内容不追求面面俱到，只记录真正理解、经过实践验证的知识点。

---

## 目录结构

```
AI-Fullstack-Notes/
├── ai/                          # AI / Agent 相关笔记
│   ├── ai-agent-dev-composite-agent.md
│   ├── claude-code-quickstart.md
│   ├── codex-plugin-claude-code.md
│   ├── langchain-architecture.md
│   ├── langgraph-intro.md
│   └── rag-mvp-to-production.md
├── backend/                     # 架构 / 后端笔记
│   ├── high-concurrency-architecture.md
│   ├── nginx-reverse-proxy-load-balance.md
│   └── redis-cache-core-qa.md
├── infra/                       # 基础设施 / 运维笔记
│   ├── docker-basics-dockerfile.md
│   ├── docker-compose-vs-swarm.md
│   ├── ssh-public-key-auth.md
│   ├── supabase-docker-self-host.md
│   └── ubuntu-redis-install-remote-config.md
└── projects/                    # 项目实战笔记
    ├── fastsam-demo-v2-docker-export.md
    ├── fastsam-demo-v1-fullstack.md
    └── github-profile-readme-guide.md
```

---

## 笔记索引

### 🤖 AI / Agent

| 文件 | 说明 |
|------|------|
| [langchain-architecture.md](./ai/langchain-architecture.md) | LangChain 架构解析 |
| [langgraph-intro.md](./ai/langgraph-intro.md) | LangGraph — 通过图结构重新定义 LLM 应用 |
| [rag-mvp-to-production.md](./ai/rag-mvp-to-production.md) | RAG 从 MVP 到生产落地 |
| [ai-agent-dev-composite-agent.md](./ai/ai-agent-dev-composite-agent.md) | AI Agent 开发 — 组合型 Agent 设计 |

### 🛠️ 工具 / 开发效率

| 文件 | 说明 |
|------|------|
| [claude-code-quickstart.md](./ai/claude-code-quickstart.md) | Claude Code CLI 快速上手教程 |
| [codex-plugin-claude-code.md](./ai/codex-plugin-claude-code.md) | Codex Plugin 与 Claude Code 使用指南 |
| [github-profile-readme-guide.md](./projects/github-profile-readme-guide.md) | GitHub Profile README 搭建指南 |

### 🐳 基础设施 / 运维

| 文件 | 说明 |
|------|------|
| [docker-basics-dockerfile.md](./infra/docker-basics-dockerfile.md) | Docker 基础与 Dockerfile 编写 |
| [docker-compose-vs-swarm.md](./infra/docker-compose-vs-swarm.md) | Docker Compose vs Docker Swarm 对比 |
| [supabase-docker-self-host.md](./infra/supabase-docker-self-host.md) | 5 分钟用 Docker 自建 Supabase |
| [ssh-public-key-auth.md](./infra/ssh-public-key-auth.md) | SSH 公钥认证配置 |
| [ubuntu-redis-install-remote-config.md](./infra/ubuntu-redis-install-remote-config.md) | Ubuntu 安装 Redis 与远程连接配置 |

### 🏗️ 架构 / 后端

| 文件 | 说明 |
|------|------|
| [high-concurrency-architecture.md](./backend/high-concurrency-architecture.md) | 面向中小型企业内部系统的高并发架构设计思考 |
| [nginx-reverse-proxy-load-balance.md](./backend/nginx-reverse-proxy-load-balance.md) | Nginx 反向代理与负载均衡 |
| [redis-cache-core-qa.md](./backend/redis-cache-core-qa.md) | Redis 分布式缓存核心问答（上） |

### 🚀 项目实战

| 文件 | 说明 |
|------|------|
| [fastsam-demo-v1-fullstack.md](./projects/fastsam-demo-v1-fullstack.md) | FastSAM-Demo V1 — 基于 SAM 2.1 的图像分割全栈实践 |
| [fastsam-demo-v2-docker-export.md](./projects/fastsam-demo-v2-docker-export.md) | FastSAM-Demo V2 — Docker 部署与导出功能落地 |

---

## 微信公众号

本仓库的文章同步发布在微信公众号:小邓同学的研习社，欢迎关注获取最新更新：

<p align="center">
  <img src="./imgs/微信图片_20260410163831_51_8.jpg" alt="微信公众号二维码" width="200" />
</p>

---

## 贡献与交流

本仓库以个人学习为主，如发现错误或有更好的理解方式，欢迎提 Issue 讨论。

---

持续更新中 · 最后更新: 2026-04-10
