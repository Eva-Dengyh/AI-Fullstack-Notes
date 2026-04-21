<div align="center">

# AI-Fullstack-Notes

**全栈工程师的 AI / Agent 学习笔记** — 基础概念、框架导读、项目实战与精选资源，追求可复用的知识体系。

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)
[![在线阅读](https://img.shields.io/badge/在线阅读-mdBook-2563eb?style=flat-square)](https://eva-dengyh.github.io/AI-Fullstack-Notes/)
[![仓库](https://img.shields.io/badge/GitHub-仓库-181717?style=flat-square&logo=github)](https://github.com/Eva-Dengyh/AI-Fullstack-Notes)

<br />

**作者: Eva** · 全栈工程师

[在线阅读](https://eva-dengyh.github.io/AI-Fullstack-Notes/) · [提 Issue](https://github.com/Eva-Dengyh/AI-Fullstack-Notes/issues)

</div>

<br />

## 本页导航

| 区块 | 说明 |
|------|------|
| [关于本仓库](#关于本仓库) | 定位与读者 |
| [仓库结构](#仓库结构) | 目录树（可展开） |
| [笔记索引](#笔记索引) | 按主题跳转各篇笔记 |
| [Hermes Agent 文档](#hermes-agent-文档) | 官方文档整理与中英对照 |
| [教程索引](#教程索引) | 可复现的上手教程 |
| [微信公众号](#微信公众号) | 同步更新渠道 |
| [贡献与交流](#贡献与交流) | Issue 与反馈 |

---

## 关于本仓库

面向**有一定工程基础**、希望系统性进入 **AI / Agent** 开发的全栈工程师。内容为个人持续整理的学习笔记：不追求面面俱到，只写**真正理解且经实践验证**的部分。

---

## 仓库结构

<details>
<summary><b>展开查看目录树</b></summary>

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
├── hermes-agent/                # Hermes Agent 文档（门户 + 各章）
│   ├── index.md
│   ├── getting-started/         # 安装、快速开始、学习路径等（英 * .md / 中 *_zh.md）
│   ├── user-guide/             # 配置、CLI、features、messaging、skills 等
│   ├── guides/                  # 实践教程与技巧
│   ├── developer-guide/        # 架构与扩展开发（中文译本持续对齐英文章）
│   ├── reference/              # CLI / FAQ / 工具 / 环境变量等参考
│   └── integrations/           # 提供商与集成说明
├── infra/                       # 基础设施 / 运维笔记
│   ├── docker-basics-dockerfile.md
│   ├── docker-compose-vs-swarm.md
│   ├── ssh-public-key-auth.md
│   ├── supabase-docker-self-host.md
│   └── ubuntu-redis-install-remote-config.md
├── projects/                    # 项目实战笔记
│   ├── fastsam-demo-v1-fullstack.md
│   ├── fastsam-demo-v2-docker-export.md
│   ├── github-profile-readme-guide.md
│   └── hermes-agent/            # Hermes 个人实战系列（与 hermes-agent/ 文档区分）
│       ├── README.md
│       └── 01-setup-and-project-structure.md
└── tutorials/                   # 教程 / 上手指南
    └── mdbook-github-pages-tutorial.md
```

</details>

---

## 笔记索引

### AI / Agent

| 文件 | 说明 |
|------|------|
| [langchain-architecture.md](./ai/langchain-architecture.md) | LangChain 架构解析 |
| [langgraph-intro.md](./ai/langgraph-intro.md) | LangGraph — 通过图结构重新定义 LLM 应用 |
| [rag-mvp-to-production.md](./ai/rag-mvp-to-production.md) | RAG 从 MVP 到生产落地 |
| [ai-agent-dev-composite-agent.md](./ai/ai-agent-dev-composite-agent.md) | AI Agent 开发 — 组合型 Agent 设计 |

### 工具 / 开发效率

| 文件 | 说明 |
|------|------|
| [claude-code-quickstart.md](./ai/claude-code-quickstart.md) | Claude Code CLI 快速上手教程 |
| [codex-plugin-claude-code.md](./ai/codex-plugin-claude-code.md) | Codex Plugin 与 Claude Code 使用指南 |
| [github-profile-readme-guide.md](./projects/github-profile-readme-guide.md) | GitHub Profile README 搭建指南 |

### 基础设施 / 运维

| 文件 | 说明 |
|------|------|
| [docker-basics-dockerfile.md](./infra/docker-basics-dockerfile.md) | Docker 基础与 Dockerfile 编写 |
| [docker-compose-vs-swarm.md](./infra/docker-compose-vs-swarm.md) | Docker Compose vs Docker Swarm 对比 |
| [supabase-docker-self-host.md](./infra/supabase-docker-self-host.md) | 5 分钟用 Docker 自建 Supabase |
| [ssh-public-key-auth.md](./infra/ssh-public-key-auth.md) | SSH 公钥认证配置 |
| [ubuntu-redis-install-remote-config.md](./infra/ubuntu-redis-install-remote-config.md) | Ubuntu 安装 Redis 与远程连接配置 |

### 架构 / 后端

| 文件 | 说明 |
|------|------|
| [high-concurrency-architecture.md](./backend/high-concurrency-architecture.md) | 面向中小型企业内部系统的高并发架构设计思考 |
| [nginx-reverse-proxy-load-balance.md](./backend/nginx-reverse-proxy-load-balance.md) | Nginx 反向代理与负载均衡 |
| [redis-cache-core-qa.md](./backend/redis-cache-core-qa.md) | Redis 分布式缓存核心问答（上） |

### 项目实战

| 文件 | 说明 |
|------|------|
| [fastsam-demo-v1-fullstack.md](./projects/fastsam-demo-v1-fullstack.md) | FastSAM-Demo V1 — 基于 SAM 2.1 的图像分割全栈实践 |
| [fastsam-demo-v2-docker-export.md](./projects/fastsam-demo-v2-docker-export.md) | FastSAM-Demo V2 — Docker 部署与导出功能落地 |

### Hermes Agent 文档

独立目录 [`hermes-agent/`](./hermes-agent/) 收录 Hermes Agent 的文档整理；与 [`projects/hermes-agent/`](./projects/hermes-agent/)（个人实战笔记系列）并列，用途不同。

| 入口 | 说明 |
|------|------|
| [hermes-agent/index.md](./hermes-agent/index.md) | 文档门户与快速链接 |
| 中文页面 | 与英文同目录下的 `*_zh.md`（含 `developer-guide/`、`guides/`、`reference/`、`user-guide/features/` 等）；在线阅读见 [mdBook](https://eva-dengyh.github.io/AI-Fullstack-Notes/) 侧栏「Hermes Agent · …（中文）」 |

---

## 教程索引

| 文件 | 说明 |
|------|------|
| [mdbook-github-pages-tutorial.md](./tutorials/mdbook-github-pages-tutorial.md) | 用 mdBook + GitHub Pages 搭建个人技术笔记站 |

---

## 微信公众号

文章同步发布在微信公众号 **小邓同学的研习社**，欢迎关注获取更新。

<p align="center">
  <img src="./imgs/微信图片_20260410163831_51_8.jpg" alt="微信公众号二维码" width="220" />
</p>

---

## 贡献与交流

个人学习向仓库；发现错误或有不同理解，欢迎 [提交 Issue](https://github.com/Eva-Dengyh/AI-Fullstack-Notes/issues) 讨论。

---

<div align="center">

<sub>持续更新中 · 最后更新：2026-04-13</sub>

</div>
