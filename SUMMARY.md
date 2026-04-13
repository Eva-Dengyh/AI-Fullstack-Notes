# 目录

[前言](README.md)

---

# AI / Agent

- [LangChain 架构浅析](ai/langchain-architecture.md)
- [LangGraph — 通过图结构重新定义 LLM 应用](ai/langgraph-intro.md)
- [RAG 实战：从手写 MVP 到生产级优化](ai/rag-mvp-to-production.md)
- [AI Agent 开发：零基础构建复合智能体](ai/ai-agent-dev-composite-agent.md)

# 工具 / 开发效率

- [Claude Code CLI 快速上手](ai/claude-code-quickstart.md)
- [Codex Plugin 与 Claude Code](ai/codex-plugin-claude-code.md)

# 架构 / 后端

- [高并发架构设计思考](backend/high-concurrency-architecture.md)
- [Nginx 全解析：反向代理与负载均衡](backend/nginx-reverse-proxy-load-balance.md)
- [Redis 分布式缓存核心问答（上）](backend/redis-cache-core-qa.md)

# 基础设施 / 运维

- [Docker 基础与 Dockerfile 编写](infra/docker-basics-dockerfile.md)
- [Docker Compose vs Docker Swarm](infra/docker-compose-vs-swarm.md)
- [5 分钟用 Docker 自建 Supabase](infra/supabase-docker-self-host.md)
- [Ubuntu 安装 Redis 与远程连接配置](infra/ubuntu-redis-install-remote-config.md)
- [SSH 公钥认证配置](infra/ssh-public-key-auth.md)

# 项目实战

- [FastSAM-Demo V1 — SAM 2.1 全栈图像分割](projects/fastsam-demo-v1-fullstack.md)
- [FastSAM-Demo V2 — Docker 部署与导出功能](projects/fastsam-demo-v2-docker-export.md)
- [GitHub Profile README 搭建指南](projects/github-profile-readme-guide.md)
- [Hermes Agent 系列](projects/hermes-agent/README.md)
  - [（1）本地启动与项目结构](projects/hermes-agent/01-setup-and-project-structure.md)

# Hermes Agent 文档

- [Hermes Agent Documentation](hermes-agent/index.md)

# Hermes Agent · 入门

- [Installation](hermes-agent/getting-started/installation.md)
- [Quickstart](hermes-agent/getting-started/quickstart.md)
- [Learning Path](hermes-agent/getting-started/learning-path.md)
- [本地启动与项目结构](hermes-agent/getting-started/01-setup-and-project-structure.md)
- [Nix & NixOS Setup](hermes-agent/getting-started/nix-setup.md)
- [Updating & Uninstalling](hermes-agent/getting-started/updating.md)
- [Android / Termux](hermes-agent/getting-started/termux.md)

# Hermes Agent · 用户指南

- [Configuration](hermes-agent/user-guide/configuration.md)
- [Docker](hermes-agent/user-guide/docker.md)
- [CLI Interface](hermes-agent/user-guide/cli.md)
- [Sessions](hermes-agent/user-guide/sessions.md)
- [Security](hermes-agent/user-guide/security.md)
- [Profiles: Running Multiple Agents](hermes-agent/user-guide/profiles.md)
- [Checkpoints and /rollback](hermes-agent/user-guide/checkpoints-and-rollback.md)
- [Git Worktrees](hermes-agent/user-guide/git-worktrees.md)
- [功能（Features）](hermes-agent/user-guide/features/overview.md)
  - [ACP Editor Integration](hermes-agent/user-guide/features/acp.md)
  - [API Server](hermes-agent/user-guide/features/api-server.md)
  - [Batch Processing](hermes-agent/user-guide/features/batch-processing.md)
  - [Browser Automation](hermes-agent/user-guide/features/browser.md)
  - [Code Execution](hermes-agent/user-guide/features/code-execution.md)
  - [Context Files](hermes-agent/user-guide/features/context-files.md)
  - [Context References](hermes-agent/user-guide/features/context-references.md)
  - [Credential Pools](hermes-agent/user-guide/features/credential-pools.md)
  - [Scheduled Tasks (Cron)](hermes-agent/user-guide/features/cron.md)
  - [Subagent Delegation](hermes-agent/user-guide/features/delegation.md)
  - [Event Hooks](hermes-agent/user-guide/features/hooks.md)
  - [Honcho Memory](hermes-agent/user-guide/features/honcho.md)
  - [Image Generation](hermes-agent/user-guide/features/image-generation.md)
  - [MCP (Model Context Protocol)](hermes-agent/user-guide/features/mcp.md)
  - [Persistent Memory](hermes-agent/user-guide/features/memory.md)
  - [Memory Providers](hermes-agent/user-guide/features/memory-providers.md)
  - [Personality & SOUL.md](hermes-agent/user-guide/features/personality.md)
  - [Plugins](hermes-agent/user-guide/features/plugins.md)
  - [Provider Routing](hermes-agent/user-guide/features/provider-routing.md)
  - [Fallback Providers](hermes-agent/user-guide/features/fallback-providers.md)
  - [RL Training](hermes-agent/user-guide/features/rl-training.md)
  - [Skills System](hermes-agent/user-guide/features/skills.md)
  - [Skins & Themes](hermes-agent/user-guide/features/skins.md)
  - [Tools & Toolsets](hermes-agent/user-guide/features/tools.md)
  - [Voice & TTS](hermes-agent/user-guide/features/tts.md)
  - [Vision & Image Paste](hermes-agent/user-guide/features/vision.md)
  - [Voice Mode](hermes-agent/user-guide/features/voice-mode.md)
- [消息网关（Messaging）](hermes-agent/user-guide/messaging/index.md)
  - [BlueBubbles (iMessage)](hermes-agent/user-guide/messaging/bluebubbles.md)
  - [DingTalk](hermes-agent/user-guide/messaging/dingtalk.md)
  - [Discord](hermes-agent/user-guide/messaging/discord.md)
  - [Email](hermes-agent/user-guide/messaging/email.md)
  - [Feishu / Lark](hermes-agent/user-guide/messaging/feishu.md)
  - [Home Assistant](hermes-agent/user-guide/messaging/homeassistant.md)
  - [Matrix](hermes-agent/user-guide/messaging/matrix.md)
  - [Mattermost](hermes-agent/user-guide/messaging/mattermost.md)
  - [Open WebUI](hermes-agent/user-guide/messaging/open-webui.md)
  - [Signal](hermes-agent/user-guide/messaging/signal.md)
  - [Slack](hermes-agent/user-guide/messaging/slack.md)
  - [SMS (Twilio)](hermes-agent/user-guide/messaging/sms.md)
  - [Telegram](hermes-agent/user-guide/messaging/telegram.md)
  - [Webhooks](hermes-agent/user-guide/messaging/webhooks.md)
  - [WeCom (Enterprise WeChat)](hermes-agent/user-guide/messaging/wecom.md)
  - [WeCom Callback (Self-Built App)](hermes-agent/user-guide/messaging/wecom-callback.md)
  - [Weixin (WeChat)](hermes-agent/user-guide/messaging/weixin.md)
  - [WhatsApp](hermes-agent/user-guide/messaging/whatsapp.md)
- [G0DM0D3 — Godmode Jailbreaking](hermes-agent/user-guide/skills/godmode.md)

# Hermes Agent · 实践指南

- [Automate Anything with Cron](hermes-agent/guides/automate-with-cron.md)
- [Build a Hermes Plugin](hermes-agent/guides/build-a-hermes-plugin.md)
- [Cron Troubleshooting](hermes-agent/guides/cron-troubleshooting.md)
- [Tutorial: Daily Briefing Bot](hermes-agent/guides/daily-briefing-bot.md)
- [Delegation & Parallel Work](hermes-agent/guides/delegation-patterns.md)
- [Run Local LLMs on Mac](hermes-agent/guides/local-llm-on-mac.md)
- [Migrate from OpenClaw](hermes-agent/guides/migrate-from-openclaw.md)
- [Using Hermes as a Python Library](hermes-agent/guides/python-library.md)
- [Tutorial: Team Telegram Assistant](hermes-agent/guides/team-telegram-assistant.md)
- [Tips & Best Practices](hermes-agent/guides/tips.md)
- [Use MCP with Hermes](hermes-agent/guides/use-mcp-with-hermes.md)
- [Use SOUL.md with Hermes](hermes-agent/guides/use-soul-with-hermes.md)
- [Use Voice Mode with Hermes](hermes-agent/guides/use-voice-mode-with-hermes.md)
- [Working with Skills](hermes-agent/guides/work-with-skills.md)

# Hermes Agent · 开发者指南

- [ACP Internals](hermes-agent/developer-guide/acp-internals.md)
- [Adding a Platform Adapter](hermes-agent/developer-guide/adding-platform-adapters.md)
- [Adding Providers](hermes-agent/developer-guide/adding-providers.md)
- [Adding Tools](hermes-agent/developer-guide/adding-tools.md)
- [Agent Loop Internals](hermes-agent/developer-guide/agent-loop.md)
- [Architecture](hermes-agent/developer-guide/architecture.md)
- [Context Compression and Caching](hermes-agent/developer-guide/context-compression-and-caching.md)
- [Context Engine Plugins](hermes-agent/developer-guide/context-engine-plugin.md)
- [Contributing](hermes-agent/developer-guide/contributing.md)
- [Creating Skills](hermes-agent/developer-guide/creating-skills.md)
- [Cron Internals](hermes-agent/developer-guide/cron-internals.md)
- [Environments, Benchmarks & Data Generation](hermes-agent/developer-guide/environments.md)
- [Extending the CLI](hermes-agent/developer-guide/extending-the-cli.md)
- [Gateway Internals](hermes-agent/developer-guide/gateway-internals.md)
- [Memory Provider Plugins](hermes-agent/developer-guide/memory-provider-plugin.md)
- [Prompt Assembly](hermes-agent/developer-guide/prompt-assembly.md)
- [Provider Runtime Resolution](hermes-agent/developer-guide/provider-runtime.md)
- [Session Storage](hermes-agent/developer-guide/session-storage.md)
- [Tools Runtime](hermes-agent/developer-guide/tools-runtime.md)
- [Trajectory Format](hermes-agent/developer-guide/trajectory-format.md)

# Hermes Agent · 参考

- [CLI Commands Reference](hermes-agent/reference/cli-commands.md)
- [Environment Variables](hermes-agent/reference/environment-variables.md)
- [FAQ & Troubleshooting](hermes-agent/reference/faq.md)
- [MCP Config Reference](hermes-agent/reference/mcp-config-reference.md)
- [Optional Skills Catalog](hermes-agent/reference/optional-skills-catalog.md)
- [Profile Commands Reference](hermes-agent/reference/profile-commands.md)
- [Bundled Skills Catalog](hermes-agent/reference/skills-catalog.md)
- [Slash Commands Reference](hermes-agent/reference/slash-commands.md)
- [Built-in Tools Reference](hermes-agent/reference/tools-reference.md)
- [Toolsets Reference](hermes-agent/reference/toolsets-reference.md)

# Hermes Agent · 集成

- [Integrations](hermes-agent/integrations/index.md)
- [AI Providers](hermes-agent/integrations/providers.md)

# Hermes Agent · 入门（中文）

- [安装](hermes-agent/getting-started/installation_zh.md)
- [快速开始](hermes-agent/getting-started/quickstart_zh.md)
- [学习路径](hermes-agent/getting-started/learning-path_zh.md)
- [（1）本地启动与项目结构](hermes-agent/getting-started/01-setup-and-project-structure_zh.md)
- [Nix & NixOS 设置](hermes-agent/getting-started/nix-setup_zh.md)
- [更新和卸载](hermes-agent/getting-started/updating_zh.md)
- [Android / Termux](hermes-agent/getting-started/termux_zh.md)

# Hermes Agent · 用户指南（中文）

- [CLI 界面](hermes-agent/user-guide/cli_zh.md)
- [Profiles：运行多个 Agent](hermes-agent/user-guide/profiles_zh.md)
- [功能概览](hermes-agent/user-guide/features/overview_zh.md)
  - [ACP 编辑器集成](hermes-agent/user-guide/features/acp_zh.md)
  - [API 服务器](hermes-agent/user-guide/features/api-server_zh.md)
  - [批处理](hermes-agent/user-guide/features/batch-processing_zh.md)
  - [浏览器自动化](hermes-agent/user-guide/features/browser_zh.md)
  - [代码执行](hermes-agent/user-guide/features/code-execution_zh.md)
  - [上下文文件](hermes-agent/user-guide/features/context-files_zh.md)
  - [定时任务（Cron）](hermes-agent/user-guide/features/cron_zh.md)
  - [子 Agent 委托](hermes-agent/user-guide/features/delegation_zh.md)
  - [图像生成](hermes-agent/user-guide/features/image-generation_zh.md)
  - [MCP（模型上下文协议）](hermes-agent/user-guide/features/mcp_zh.md)
  - [持久记忆](hermes-agent/user-guide/features/memory_zh.md)
  - [提供商路由](hermes-agent/user-guide/features/provider-routing_zh.md)
  - [备用提供商](hermes-agent/user-guide/features/fallback-providers_zh.md)
  - [RL 训练](hermes-agent/user-guide/features/rl-training_zh.md)
  - [技能系统](hermes-agent/user-guide/features/skills_zh.md)
  - [工具和工具集](hermes-agent/user-guide/features/tools_zh.md)
  - [语音和文本转语音](hermes-agent/user-guide/features/tts_zh.md)
  - [视觉和图像粘贴](hermes-agent/user-guide/features/vision_zh.md)
  - [语音模式](hermes-agent/user-guide/features/voice-mode_zh.md)

# Hermes Agent · 实践指南（中文）

- [用 Cron 自动化任何事](hermes-agent/guides/automate-with-cron_zh.md)
- [构建一个 Hermes 插件](hermes-agent/guides/build-a-hermes-plugin_zh.md)
- [Cron 排障指南](hermes-agent/guides/cron-troubleshooting_zh.md)
- [教程：每日简报机器人](hermes-agent/guides/daily-briefing-bot_zh.md)
- [委派与并行工作](hermes-agent/guides/delegation-patterns_zh.md)
- [在 Mac 上运行本地 LLM](hermes-agent/guides/local-llm-on-mac_zh.md)
- [从 OpenClaw 迁移](hermes-agent/guides/migrate-from-openclaw_zh.md)
- [把 Hermes 当作 Python 库使用](hermes-agent/guides/python-library_zh.md)
- [教程：团队 Telegram 助手](hermes-agent/guides/team-telegram-assistant_zh.md)
- [技巧与最佳实践](hermes-agent/guides/tips_zh.md)
- [在 Hermes 中使用 MCP](hermes-agent/guides/use-mcp-with-hermes_zh.md)
- [在 Hermes 中使用 SOUL.md](hermes-agent/guides/use-soul-with-hermes_zh.md)
- [在 Hermes 中使用语音模式](hermes-agent/guides/use-voice-mode-with-hermes_zh.md)
- [使用 Skills](hermes-agent/guides/work-with-skills_zh.md)

# Hermes Agent · 开发者指南（中文）

- [ACP 内部机制](hermes-agent/developer-guide/acp-internals_zh.md)
- [添加平台适配器](hermes-agent/developer-guide/adding-platform-adapters_zh.md)
- [添加 Provider](hermes-agent/developer-guide/adding-providers_zh.md)
- [添加工具](hermes-agent/developer-guide/adding-tools_zh.md)
- [Agent Loop 内部机制](hermes-agent/developer-guide/agent-loop_zh.md)
- [架构](hermes-agent/developer-guide/architecture_zh.md)
- [上下文压缩与缓存](hermes-agent/developer-guide/context-compression-and-caching_zh.md)
- [构建 Context Engine 插件](hermes-agent/developer-guide/context-engine-plugin_zh.md)
- [贡献指南](hermes-agent/developer-guide/contributing_zh.md)
- [创建技能](hermes-agent/developer-guide/creating-skills_zh.md)
- [Cron 内部机制](hermes-agent/developer-guide/cron-internals_zh.md)
- [环境、评测与数据生成](hermes-agent/developer-guide/environments_zh.md)
- [扩展 CLI](hermes-agent/developer-guide/extending-the-cli_zh.md)
- [Gateway 内部机制](hermes-agent/developer-guide/gateway-internals_zh.md)
- [构建 Memory Provider 插件](hermes-agent/developer-guide/memory-provider-plugin_zh.md)
- [提示词组装](hermes-agent/developer-guide/prompt-assembly_zh.md)
- [Provider 运行时解析](hermes-agent/developer-guide/provider-runtime_zh.md)
- [会话存储](hermes-agent/developer-guide/session-storage_zh.md)
- [工具运行时](hermes-agent/developer-guide/tools-runtime_zh.md)
- [轨迹格式](hermes-agent/developer-guide/trajectory-format_zh.md)

# Hermes Agent · 参考（中文）

- [CLI 命令参考](hermes-agent/reference/cli-commands_zh.md)
- [FAQ 与故障排查](hermes-agent/reference/faq_zh.md)
- [MCP 配置参考](hermes-agent/reference/mcp-config-reference_zh.md)
- [可选技能目录](hermes-agent/reference/optional-skills-catalog_zh.md)
- [Profile 命令参考](hermes-agent/reference/profile-commands_zh.md)
- [斜杠命令参考](hermes-agent/reference/slash-commands_zh.md)
- [内置工具参考](hermes-agent/reference/tools-reference_zh.md)
- [工具集参考](hermes-agent/reference/toolsets-reference_zh.md)

# 教程 / 上手指南

- [用 mdBook + GitHub Pages 搭建个人技术笔记站](tutorials/mdbook-github-pages-tutorial.md)
