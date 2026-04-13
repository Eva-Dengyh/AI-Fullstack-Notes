// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="index.html">前言</a></span></li><li class="chapter-item expanded "><li class="spacer"></li></li><li class="chapter-item expanded "><li class="part-title">AI / Agent</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/langchain-architecture.html"><strong aria-hidden="true">1.</strong> LangChain 架构浅析</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/langgraph-intro.html"><strong aria-hidden="true">2.</strong> LangGraph — 通过图结构重新定义 LLM 应用</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/rag-mvp-to-production.html"><strong aria-hidden="true">3.</strong> RAG 实战：从手写 MVP 到生产级优化</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/ai-agent-dev-composite-agent.html"><strong aria-hidden="true">4.</strong> AI Agent 开发：零基础构建复合智能体</a></span></li><li class="chapter-item expanded "><li class="part-title">工具 / 开发效率</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/claude-code-quickstart.html"><strong aria-hidden="true">5.</strong> Claude Code CLI 快速上手</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="ai/codex-plugin-claude-code.html"><strong aria-hidden="true">6.</strong> Codex Plugin 与 Claude Code</a></span></li><li class="chapter-item expanded "><li class="part-title">架构 / 后端</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="backend/high-concurrency-architecture.html"><strong aria-hidden="true">7.</strong> 高并发架构设计思考</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="backend/nginx-reverse-proxy-load-balance.html"><strong aria-hidden="true">8.</strong> Nginx 全解析：反向代理与负载均衡</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="backend/redis-cache-core-qa.html"><strong aria-hidden="true">9.</strong> Redis 分布式缓存核心问答（上）</a></span></li><li class="chapter-item expanded "><li class="part-title">基础设施 / 运维</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="infra/docker-basics-dockerfile.html"><strong aria-hidden="true">10.</strong> Docker 基础与 Dockerfile 编写</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="infra/docker-compose-vs-swarm.html"><strong aria-hidden="true">11.</strong> Docker Compose vs Docker Swarm</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="infra/supabase-docker-self-host.html"><strong aria-hidden="true">12.</strong> 5 分钟用 Docker 自建 Supabase</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="infra/ubuntu-redis-install-remote-config.html"><strong aria-hidden="true">13.</strong> Ubuntu 安装 Redis 与远程连接配置</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="infra/ssh-public-key-auth.html"><strong aria-hidden="true">14.</strong> SSH 公钥认证配置</a></span></li><li class="chapter-item expanded "><li class="part-title">项目实战</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="projects/fastsam-demo-v1-fullstack.html"><strong aria-hidden="true">15.</strong> FastSAM-Demo V1 — SAM 2.1 全栈图像分割</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="projects/fastsam-demo-v2-docker-export.html"><strong aria-hidden="true">16.</strong> FastSAM-Demo V2 — Docker 部署与导出功能</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="projects/github-profile-readme-guide.html"><strong aria-hidden="true">17.</strong> GitHub Profile README 搭建指南</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="projects/hermes-agent/index.html"><strong aria-hidden="true">18.</strong> Hermes Agent 系列</a></span><ol class="section"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="projects/hermes-agent/01-setup-and-project-structure.html"><strong aria-hidden="true">18.1.</strong> （1）本地启动与项目结构</a></span></li></ol><li class="chapter-item expanded "><li class="part-title">Hermes Agent 文档</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/index.html"><strong aria-hidden="true">19.</strong> Hermes Agent Documentation</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 入门</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/installation.html"><strong aria-hidden="true">20.</strong> Installation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/quickstart.html"><strong aria-hidden="true">21.</strong> Quickstart</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/learning-path.html"><strong aria-hidden="true">22.</strong> Learning Path</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/01-setup-and-project-structure.html"><strong aria-hidden="true">23.</strong> 本地启动与项目结构</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/nix-setup.html"><strong aria-hidden="true">24.</strong> Nix &amp; NixOS Setup</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/updating.html"><strong aria-hidden="true">25.</strong> Updating &amp; Uninstalling</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/getting-started/termux.html"><strong aria-hidden="true">26.</strong> Android / Termux</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 用户指南</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/configuration.html"><strong aria-hidden="true">27.</strong> Configuration</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/docker.html"><strong aria-hidden="true">28.</strong> Docker</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/cli.html"><strong aria-hidden="true">29.</strong> CLI Interface</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/sessions.html"><strong aria-hidden="true">30.</strong> Sessions</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/security.html"><strong aria-hidden="true">31.</strong> Security</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/profiles.html"><strong aria-hidden="true">32.</strong> Profiles: Running Multiple Agents</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/checkpoints-and-rollback.html"><strong aria-hidden="true">33.</strong> Checkpoints and /rollback</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/git-worktrees.html"><strong aria-hidden="true">34.</strong> Git Worktrees</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/overview.html"><strong aria-hidden="true">35.</strong> 功能（Features）</a></span><ol class="section"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/acp.html"><strong aria-hidden="true">35.1.</strong> ACP Editor Integration</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/api-server.html"><strong aria-hidden="true">35.2.</strong> API Server</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/batch-processing.html"><strong aria-hidden="true">35.3.</strong> Batch Processing</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/browser.html"><strong aria-hidden="true">35.4.</strong> Browser Automation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/code-execution.html"><strong aria-hidden="true">35.5.</strong> Code Execution</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/context-files.html"><strong aria-hidden="true">35.6.</strong> Context Files</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/context-references.html"><strong aria-hidden="true">35.7.</strong> Context References</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/credential-pools.html"><strong aria-hidden="true">35.8.</strong> Credential Pools</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/cron.html"><strong aria-hidden="true">35.9.</strong> Scheduled Tasks (Cron)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/delegation.html"><strong aria-hidden="true">35.10.</strong> Subagent Delegation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/hooks.html"><strong aria-hidden="true">35.11.</strong> Event Hooks</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/honcho.html"><strong aria-hidden="true">35.12.</strong> Honcho Memory</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/image-generation.html"><strong aria-hidden="true">35.13.</strong> Image Generation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/mcp.html"><strong aria-hidden="true">35.14.</strong> MCP (Model Context Protocol)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/memory.html"><strong aria-hidden="true">35.15.</strong> Persistent Memory</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/memory-providers.html"><strong aria-hidden="true">35.16.</strong> Memory Providers</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/personality.html"><strong aria-hidden="true">35.17.</strong> Personality &amp; SOUL.md</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/plugins.html"><strong aria-hidden="true">35.18.</strong> Plugins</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/provider-routing.html"><strong aria-hidden="true">35.19.</strong> Provider Routing</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/fallback-providers.html"><strong aria-hidden="true">35.20.</strong> Fallback Providers</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/rl-training.html"><strong aria-hidden="true">35.21.</strong> RL Training</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/skills.html"><strong aria-hidden="true">35.22.</strong> Skills System</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/skins.html"><strong aria-hidden="true">35.23.</strong> Skins &amp; Themes</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/tools.html"><strong aria-hidden="true">35.24.</strong> Tools &amp; Toolsets</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/tts.html"><strong aria-hidden="true">35.25.</strong> Voice &amp; TTS</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/vision.html"><strong aria-hidden="true">35.26.</strong> Vision &amp; Image Paste</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/features/voice-mode.html"><strong aria-hidden="true">35.27.</strong> Voice Mode</a></span></li></ol><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/index.html"><strong aria-hidden="true">36.</strong> 消息网关（Messaging）</a></span><ol class="section"><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/bluebubbles.html"><strong aria-hidden="true">36.1.</strong> BlueBubbles (iMessage)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/dingtalk.html"><strong aria-hidden="true">36.2.</strong> DingTalk</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/discord.html"><strong aria-hidden="true">36.3.</strong> Discord</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/email.html"><strong aria-hidden="true">36.4.</strong> Email</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/feishu.html"><strong aria-hidden="true">36.5.</strong> Feishu / Lark</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/homeassistant.html"><strong aria-hidden="true">36.6.</strong> Home Assistant</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/matrix.html"><strong aria-hidden="true">36.7.</strong> Matrix</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/mattermost.html"><strong aria-hidden="true">36.8.</strong> Mattermost</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/open-webui.html"><strong aria-hidden="true">36.9.</strong> Open WebUI</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/signal.html"><strong aria-hidden="true">36.10.</strong> Signal</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/slack.html"><strong aria-hidden="true">36.11.</strong> Slack</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/sms.html"><strong aria-hidden="true">36.12.</strong> SMS (Twilio)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/telegram.html"><strong aria-hidden="true">36.13.</strong> Telegram</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/webhooks.html"><strong aria-hidden="true">36.14.</strong> Webhooks</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/wecom.html"><strong aria-hidden="true">36.15.</strong> WeCom (Enterprise WeChat)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/wecom-callback.html"><strong aria-hidden="true">36.16.</strong> WeCom Callback (Self-Built App)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/weixin.html"><strong aria-hidden="true">36.17.</strong> Weixin (WeChat)</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/messaging/whatsapp.html"><strong aria-hidden="true">36.18.</strong> WhatsApp</a></span></li></ol><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/user-guide/skills/godmode.html"><strong aria-hidden="true">37.</strong> G0DM0D3 — Godmode Jailbreaking</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 实践指南</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/automate-with-cron.html"><strong aria-hidden="true">38.</strong> Automate Anything with Cron</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/build-a-hermes-plugin.html"><strong aria-hidden="true">39.</strong> Build a Hermes Plugin</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/cron-troubleshooting.html"><strong aria-hidden="true">40.</strong> Cron Troubleshooting</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/daily-briefing-bot.html"><strong aria-hidden="true">41.</strong> Tutorial: Daily Briefing Bot</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/delegation-patterns.html"><strong aria-hidden="true">42.</strong> Delegation &amp; Parallel Work</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/local-llm-on-mac.html"><strong aria-hidden="true">43.</strong> Run Local LLMs on Mac</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/migrate-from-openclaw.html"><strong aria-hidden="true">44.</strong> Migrate from OpenClaw</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/python-library.html"><strong aria-hidden="true">45.</strong> Using Hermes as a Python Library</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/team-telegram-assistant.html"><strong aria-hidden="true">46.</strong> Tutorial: Team Telegram Assistant</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/tips.html"><strong aria-hidden="true">47.</strong> Tips &amp; Best Practices</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/use-mcp-with-hermes.html"><strong aria-hidden="true">48.</strong> Use MCP with Hermes</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/use-soul-with-hermes.html"><strong aria-hidden="true">49.</strong> Use SOUL.md with Hermes</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/use-voice-mode-with-hermes.html"><strong aria-hidden="true">50.</strong> Use Voice Mode with Hermes</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/guides/work-with-skills.html"><strong aria-hidden="true">51.</strong> Working with Skills</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 开发者指南</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/acp-internals.html"><strong aria-hidden="true">52.</strong> ACP Internals</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/adding-platform-adapters.html"><strong aria-hidden="true">53.</strong> Adding a Platform Adapter</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/adding-providers.html"><strong aria-hidden="true">54.</strong> Adding Providers</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/adding-tools.html"><strong aria-hidden="true">55.</strong> Adding Tools</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/agent-loop.html"><strong aria-hidden="true">56.</strong> Agent Loop Internals</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/architecture.html"><strong aria-hidden="true">57.</strong> Architecture</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/context-compression-and-caching.html"><strong aria-hidden="true">58.</strong> Context Compression and Caching</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/context-engine-plugin.html"><strong aria-hidden="true">59.</strong> Context Engine Plugins</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/contributing.html"><strong aria-hidden="true">60.</strong> Contributing</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/creating-skills.html"><strong aria-hidden="true">61.</strong> Creating Skills</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/cron-internals.html"><strong aria-hidden="true">62.</strong> Cron Internals</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/environments.html"><strong aria-hidden="true">63.</strong> Environments, Benchmarks &amp; Data Generation</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/extending-the-cli.html"><strong aria-hidden="true">64.</strong> Extending the CLI</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/gateway-internals.html"><strong aria-hidden="true">65.</strong> Gateway Internals</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/memory-provider-plugin.html"><strong aria-hidden="true">66.</strong> Memory Provider Plugins</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/prompt-assembly.html"><strong aria-hidden="true">67.</strong> Prompt Assembly</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/provider-runtime.html"><strong aria-hidden="true">68.</strong> Provider Runtime Resolution</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/session-storage.html"><strong aria-hidden="true">69.</strong> Session Storage</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/tools-runtime.html"><strong aria-hidden="true">70.</strong> Tools Runtime</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/developer-guide/trajectory-format.html"><strong aria-hidden="true">71.</strong> Trajectory Format</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 参考</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/cli-commands.html"><strong aria-hidden="true">72.</strong> CLI Commands Reference</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/environment-variables.html"><strong aria-hidden="true">73.</strong> Environment Variables</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/faq.html"><strong aria-hidden="true">74.</strong> FAQ &amp; Troubleshooting</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/mcp-config-reference.html"><strong aria-hidden="true">75.</strong> MCP Config Reference</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/optional-skills-catalog.html"><strong aria-hidden="true">76.</strong> Optional Skills Catalog</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/profile-commands.html"><strong aria-hidden="true">77.</strong> Profile Commands Reference</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/skills-catalog.html"><strong aria-hidden="true">78.</strong> Bundled Skills Catalog</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/slash-commands.html"><strong aria-hidden="true">79.</strong> Slash Commands Reference</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/tools-reference.html"><strong aria-hidden="true">80.</strong> Built-in Tools Reference</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/reference/toolsets-reference.html"><strong aria-hidden="true">81.</strong> Toolsets Reference</a></span></li><li class="chapter-item expanded "><li class="part-title">Hermes Agent · 集成</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/integrations/index.html"><strong aria-hidden="true">82.</strong> Integrations</a></span></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="hermes-agent/integrations/providers.html"><strong aria-hidden="true">83.</strong> AI Providers</a></span></li><li class="chapter-item expanded "><li class="part-title">教程 / 上手指南</li></li><li class="chapter-item expanded "><span class="chapter-link-wrapper"><a href="tutorials/mdbook-github-pages-tutorial.html"><strong aria-hidden="true">84.</strong> 用 mdBook + GitHub Pages 搭建个人技术笔记站</a></span></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split('#')[0].split('?')[0];
        if (current_page.endsWith('/')) {
            current_page += 'index.html';
        }
        const links = Array.prototype.slice.call(this.querySelectorAll('a'));
        const l = links.length;
        for (let i = 0; i < l; ++i) {
            const link = links[i];
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#') && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The 'index' page is supposed to alias the first chapter in the book.
            if (link.href === current_page
                || i === 0
                && path_to_root === ''
                && current_page.endsWith('/index.html')) {
                link.classList.add('active');
                let parent = link.parentElement;
                while (parent) {
                    if (parent.tagName === 'LI' && parent.classList.contains('chapter-item')) {
                        parent.classList.add('expanded');
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', e => {
            if (e.target.tagName === 'A') {
                const clientRect = e.target.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                sessionStorage.setItem('sidebar-scroll-offset', clientRect.top - sidebarRect.top);
            }
        }, { passive: true });
        const sidebarScrollOffset = sessionStorage.getItem('sidebar-scroll-offset');
        sessionStorage.removeItem('sidebar-scroll-offset');
        if (sidebarScrollOffset !== null) {
            // preserve sidebar scroll position when navigating via links within sidebar
            const activeSection = this.querySelector('.active');
            if (activeSection) {
                const clientRect = activeSection.getBoundingClientRect();
                const sidebarRect = this.getBoundingClientRect();
                const currentOffset = clientRect.top - sidebarRect.top;
                this.scrollTop += currentOffset - parseFloat(sidebarScrollOffset);
            }
        } else {
            // scroll sidebar to current active section when navigating via
            // 'next/previous chapter' buttons
            const activeSection = document.querySelector('#mdbook-sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        const sidebarAnchorToggles = document.querySelectorAll('.chapter-fold-toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(el => {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define('mdbook-sidebar-scrollbox', MDBookSidebarScrollbox);


// ---------------------------------------------------------------------------
// Support for dynamically adding headers to the sidebar.

(function() {
    // This is used to detect which direction the page has scrolled since the
    // last scroll event.
    let lastKnownScrollPosition = 0;
    // This is the threshold in px from the top of the screen where it will
    // consider a header the "current" header when scrolling down.
    const defaultDownThreshold = 150;
    // Same as defaultDownThreshold, except when scrolling up.
    const defaultUpThreshold = 300;
    // The threshold is a virtual horizontal line on the screen where it
    // considers the "current" header to be above the line. The threshold is
    // modified dynamically to handle headers that are near the bottom of the
    // screen, and to slightly offset the behavior when scrolling up vs down.
    let threshold = defaultDownThreshold;
    // This is used to disable updates while scrolling. This is needed when
    // clicking the header in the sidebar, which triggers a scroll event. It
    // is somewhat finicky to detect when the scroll has finished, so this
    // uses a relatively dumb system of disabling scroll updates for a short
    // time after the click.
    let disableScroll = false;
    // Array of header elements on the page.
    let headers;
    // Array of li elements that are initially collapsed headers in the sidebar.
    // I'm not sure why eslint seems to have a false positive here.
    // eslint-disable-next-line prefer-const
    let headerToggles = [];
    // This is a debugging tool for the threshold which you can enable in the console.
    let thresholdDebug = false;

    // Updates the threshold based on the scroll position.
    function updateThreshold() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // The number of pixels below the viewport, at most documentHeight.
        // This is used to push the threshold down to the bottom of the page
        // as the user scrolls towards the bottom.
        const pixelsBelow = Math.max(0, documentHeight - (scrollTop + windowHeight));
        // The number of pixels above the viewport, at least defaultDownThreshold.
        // Similar to pixelsBelow, this is used to push the threshold back towards
        // the top when reaching the top of the page.
        const pixelsAbove = Math.max(0, defaultDownThreshold - scrollTop);
        // How much the threshold should be offset once it gets close to the
        // bottom of the page.
        const bottomAdd = Math.max(0, windowHeight - pixelsBelow - defaultDownThreshold);
        let adjustedBottomAdd = bottomAdd;

        // Adjusts bottomAdd for a small document. The calculation above
        // assumes the document is at least twice the windowheight in size. If
        // it is less than that, then bottomAdd needs to be shrunk
        // proportional to the difference in size.
        if (documentHeight < windowHeight * 2) {
            const maxPixelsBelow = documentHeight - windowHeight;
            const t = 1 - pixelsBelow / Math.max(1, maxPixelsBelow);
            const clamp = Math.max(0, Math.min(1, t));
            adjustedBottomAdd *= clamp;
        }

        let scrollingDown = true;
        if (scrollTop < lastKnownScrollPosition) {
            scrollingDown = false;
        }

        if (scrollingDown) {
            // When scrolling down, move the threshold up towards the default
            // downwards threshold position. If near the bottom of the page,
            // adjustedBottomAdd will offset the threshold towards the bottom
            // of the page.
            const amountScrolledDown = scrollTop - lastKnownScrollPosition;
            const adjustedDefault = defaultDownThreshold + adjustedBottomAdd;
            threshold = Math.max(adjustedDefault, threshold - amountScrolledDown);
        } else {
            // When scrolling up, move the threshold down towards the default
            // upwards threshold position. If near the bottom of the page,
            // quickly transition the threshold back up where it normally
            // belongs.
            const amountScrolledUp = lastKnownScrollPosition - scrollTop;
            const adjustedDefault = defaultUpThreshold - pixelsAbove
                + Math.max(0, adjustedBottomAdd - defaultDownThreshold);
            threshold = Math.min(adjustedDefault, threshold + amountScrolledUp);
        }

        if (documentHeight <= windowHeight) {
            threshold = 0;
        }

        if (thresholdDebug) {
            const id = 'mdbook-threshold-debug-data';
            let data = document.getElementById(id);
            if (data === null) {
                data = document.createElement('div');
                data.id = id;
                data.style.cssText = `
                    position: fixed;
                    top: 50px;
                    right: 10px;
                    background-color: 0xeeeeee;
                    z-index: 9999;
                    pointer-events: none;
                `;
                document.body.appendChild(data);
            }
            data.innerHTML = `
                <table>
                  <tr><td>documentHeight</td><td>${documentHeight.toFixed(1)}</td></tr>
                  <tr><td>windowHeight</td><td>${windowHeight.toFixed(1)}</td></tr>
                  <tr><td>scrollTop</td><td>${scrollTop.toFixed(1)}</td></tr>
                  <tr><td>pixelsAbove</td><td>${pixelsAbove.toFixed(1)}</td></tr>
                  <tr><td>pixelsBelow</td><td>${pixelsBelow.toFixed(1)}</td></tr>
                  <tr><td>bottomAdd</td><td>${bottomAdd.toFixed(1)}</td></tr>
                  <tr><td>adjustedBottomAdd</td><td>${adjustedBottomAdd.toFixed(1)}</td></tr>
                  <tr><td>scrollingDown</td><td>${scrollingDown}</td></tr>
                  <tr><td>threshold</td><td>${threshold.toFixed(1)}</td></tr>
                </table>
            `;
            drawDebugLine();
        }

        lastKnownScrollPosition = scrollTop;
    }

    function drawDebugLine() {
        if (!document.body) {
            return;
        }
        const id = 'mdbook-threshold-debug-line';
        const existingLine = document.getElementById(id);
        if (existingLine) {
            existingLine.remove();
        }
        const line = document.createElement('div');
        line.id = id;
        line.style.cssText = `
            position: fixed;
            top: ${threshold}px;
            left: 0;
            width: 100vw;
            height: 2px;
            background-color: red;
            z-index: 9999;
            pointer-events: none;
        `;
        document.body.appendChild(line);
    }

    function mdbookEnableThresholdDebug() {
        thresholdDebug = true;
        updateThreshold();
        drawDebugLine();
    }

    window.mdbookEnableThresholdDebug = mdbookEnableThresholdDebug;

    // Updates which headers in the sidebar should be expanded. If the current
    // header is inside a collapsed group, then it, and all its parents should
    // be expanded.
    function updateHeaderExpanded(currentA) {
        // Add expanded to all header-item li ancestors.
        let current = currentA.parentElement;
        while (current) {
            if (current.tagName === 'LI' && current.classList.contains('header-item')) {
                current.classList.add('expanded');
            }
            current = current.parentElement;
        }
    }

    // Updates which header is marked as the "current" header in the sidebar.
    // This is done with a virtual Y threshold, where headers at or below
    // that line will be considered the current one.
    function updateCurrentHeader() {
        if (!headers || !headers.length) {
            return;
        }

        // Reset the classes, which will be rebuilt below.
        const els = document.getElementsByClassName('current-header');
        for (const el of els) {
            el.classList.remove('current-header');
        }
        for (const toggle of headerToggles) {
            toggle.classList.remove('expanded');
        }

        // Find the last header that is above the threshold.
        let lastHeader = null;
        for (const header of headers) {
            const rect = header.getBoundingClientRect();
            if (rect.top <= threshold) {
                lastHeader = header;
            } else {
                break;
            }
        }
        if (lastHeader === null) {
            lastHeader = headers[0];
            const rect = lastHeader.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top >= windowHeight) {
                return;
            }
        }

        // Get the anchor in the summary.
        const href = '#' + lastHeader.id;
        const a = [...document.querySelectorAll('.header-in-summary')]
            .find(element => element.getAttribute('href') === href);
        if (!a) {
            return;
        }

        a.classList.add('current-header');

        updateHeaderExpanded(a);
    }

    // Updates which header is "current" based on the threshold line.
    function reloadCurrentHeader() {
        if (disableScroll) {
            return;
        }
        updateThreshold();
        updateCurrentHeader();
    }


    // When clicking on a header in the sidebar, this adjusts the threshold so
    // that it is located next to the header. This is so that header becomes
    // "current".
    function headerThresholdClick(event) {
        // See disableScroll description why this is done.
        disableScroll = true;
        setTimeout(() => {
            disableScroll = false;
        }, 100);
        // requestAnimationFrame is used to delay the update of the "current"
        // header until after the scroll is done, and the header is in the new
        // position.
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Closest is needed because if it has child elements like <code>.
                const a = event.target.closest('a');
                const href = a.getAttribute('href');
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    threshold = targetElement.getBoundingClientRect().bottom;
                    updateCurrentHeader();
                }
            });
        });
    }

    // Takes the nodes from the given head and copies them over to the
    // destination, along with some filtering.
    function filterHeader(source, dest) {
        const clone = source.cloneNode(true);
        clone.querySelectorAll('mark').forEach(mark => {
            mark.replaceWith(...mark.childNodes);
        });
        dest.append(...clone.childNodes);
    }

    // Scans page for headers and adds them to the sidebar.
    document.addEventListener('DOMContentLoaded', function() {
        const activeSection = document.querySelector('#mdbook-sidebar .active');
        if (activeSection === null) {
            return;
        }

        const main = document.getElementsByTagName('main')[0];
        headers = Array.from(main.querySelectorAll('h2, h3, h4, h5, h6'))
            .filter(h => h.id !== '' && h.children.length && h.children[0].tagName === 'A');

        if (headers.length === 0) {
            return;
        }

        // Build a tree of headers in the sidebar.

        const stack = [];

        const firstLevel = parseInt(headers[0].tagName.charAt(1));
        for (let i = 1; i < firstLevel; i++) {
            const ol = document.createElement('ol');
            ol.classList.add('section');
            if (stack.length > 0) {
                stack[stack.length - 1].ol.appendChild(ol);
            }
            stack.push({level: i + 1, ol: ol});
        }

        // The level where it will start folding deeply nested headers.
        const foldLevel = 3;

        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const level = parseInt(header.tagName.charAt(1));

            const currentLevel = stack[stack.length - 1].level;
            if (level > currentLevel) {
                // Begin nesting to this level.
                for (let nextLevel = currentLevel + 1; nextLevel <= level; nextLevel++) {
                    const ol = document.createElement('ol');
                    ol.classList.add('section');
                    const last = stack[stack.length - 1];
                    const lastChild = last.ol.lastChild;
                    // Handle the case where jumping more than one nesting
                    // level, which doesn't have a list item to place this new
                    // list inside of.
                    if (lastChild) {
                        lastChild.appendChild(ol);
                    } else {
                        last.ol.appendChild(ol);
                    }
                    stack.push({level: nextLevel, ol: ol});
                }
            } else if (level < currentLevel) {
                while (stack.length > 1 && stack[stack.length - 1].level > level) {
                    stack.pop();
                }
            }

            const li = document.createElement('li');
            li.classList.add('header-item');
            li.classList.add('expanded');
            if (level < foldLevel) {
                li.classList.add('expanded');
            }
            const span = document.createElement('span');
            span.classList.add('chapter-link-wrapper');
            const a = document.createElement('a');
            span.appendChild(a);
            a.href = '#' + header.id;
            a.classList.add('header-in-summary');
            filterHeader(header.children[0], a);
            a.addEventListener('click', headerThresholdClick);
            const nextHeader = headers[i + 1];
            if (nextHeader !== undefined) {
                const nextLevel = parseInt(nextHeader.tagName.charAt(1));
                if (nextLevel > level && level >= foldLevel) {
                    const toggle = document.createElement('a');
                    toggle.classList.add('chapter-fold-toggle');
                    toggle.classList.add('header-toggle');
                    toggle.addEventListener('click', () => {
                        li.classList.toggle('expanded');
                    });
                    const toggleDiv = document.createElement('div');
                    toggleDiv.textContent = '❱';
                    toggle.appendChild(toggleDiv);
                    span.appendChild(toggle);
                    headerToggles.push(li);
                }
            }
            li.appendChild(span);

            const currentParent = stack[stack.length - 1];
            currentParent.ol.appendChild(li);
        }

        const onThisPage = document.createElement('div');
        onThisPage.classList.add('on-this-page');
        onThisPage.append(stack[0].ol);
        const activeItemSpan = activeSection.parentElement;
        activeItemSpan.after(onThisPage);
    });

    document.addEventListener('DOMContentLoaded', reloadCurrentHeader);
    document.addEventListener('scroll', reloadCurrentHeader, { passive: true });
})();

