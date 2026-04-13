---
sidebar_position: 10
title: "从 OpenClaw 迁移"
description: "完整迁移指南，讲解如何把 OpenClaw / Clawdbot 配置迁移到 Hermes Agent，包括迁移内容、配置映射和迁移后检查项"
---

# 从 OpenClaw 迁移

`hermes claw migrate` 会把你的 OpenClaw（或旧版 Clawdbot/Moldbot）配置导入 Hermes。这篇指南会说明究竟会迁移哪些内容、配置 key 如何映射，以及迁移后应该检查什么。

## 快速开始

```bash
# 先预览再迁移（总是先显示预览，然后请求确认）
hermes claw migrate

# 只预览，不做任何修改
hermes claw migrate --dry-run

# 完整迁移，包括 API keys，并跳过确认
hermes claw migrate --preset full --yes
```

迁移命令在真正写入前，总会先显示一份完整预览，告诉你将导入哪些内容。请先检查列表，再确认继续。

默认从 `~/.openclaw/` 读取。旧版 `~/.clawdbot/` 或 `~/.moltbot/` 目录会被自动识别。旧版配置文件名（`clawdbot.json`、`moltbot.json`）也会被识别。

## 选项

| 选项 | 说明 |
|--------|-------------|
| `--dry-run` | 只预览，显示将迁移什么后停止。 |
| `--preset <name>` | `full`（默认，包含 secrets）或 `user-data`（不包含 API keys）。 |
| `--overwrite` | 冲突时覆盖已有 Hermes 文件（默认：跳过）。 |
| `--migrate-secrets` | 包含 API keys（使用 `--preset full` 时默认开启）。 |
| `--source <path>` | 自定义 OpenClaw 目录。 |
| `--workspace-target <path>` | `AGENTS.md` 的放置位置。 |
| `--skill-conflict <mode>` | `skip`（默认）、`overwrite` 或 `rename`。 |
| `--yes` | 预览后跳过确认提示。 |

## 会迁移哪些内容

### Persona、memory 和指令

| 内容 | OpenClaw 来源 | Hermes 目标 | 备注 |
|------|----------------|-------------------|-------|
| Persona | `workspace/SOUL.md` | `~/.hermes/SOUL.md` | 直接复制 |
| Workspace instructions | `workspace/AGENTS.md` | `--workspace-target` 下的 `AGENTS.md` | 需要 `--workspace-target` |
| Long-term memory | `workspace/MEMORY.md` | `~/.hermes/memories/MEMORY.md` | 解析成条目，与现有内容合并并去重，使用 `§` 分隔符。 |
| User profile | `workspace/USER.md` | `~/.hermes/memories/USER.md` | 和 memory 使用相同的条目合并逻辑。 |
| Daily memory files | `workspace/memory/*.md` | `~/.hermes/memories/MEMORY.md` | 所有每日 memory 文件都会合并进主 memory。 |

Workspace 文件也会在 `workspace.default/` 和 `workspace-main/` 中作为 fallback 检查。OpenClaw 在近期版本中曾把 `workspace/` 改名为 `workspace-main/`，并使用 `workspace-{agentId}` 支持多 agent 设置。

### Skills（4 个来源）

| 来源 | OpenClaw 位置 | Hermes 目标 |
|--------|------------------|-------------------|
| Workspace skills | `workspace/skills/` | `~/.hermes/skills/openclaw-imports/` |
| Managed/shared skills | `~/.openclaw/skills/` | `~/.hermes/skills/openclaw-imports/` |
| Personal cross-project | `~/.agents/skills/` | `~/.hermes/skills/openclaw-imports/` |
| Project-level shared | `workspace/.agents/skills/` | `~/.hermes/skills/openclaw-imports/` |

Skill 冲突由 `--skill-conflict` 控制：`skip` 会保留已有 Hermes skill，`overwrite` 会覆盖，`rename` 会创建一个带 `-imported` 后缀的副本。

### 模型和 provider 配置

| 内容 | OpenClaw config path | Hermes 目标 | 备注 |
|------|---------------------|-------------------|-------|
| 默认模型 | `agents.defaults.model` | `config.yaml` → `model` | 可以是字符串，也可以是 `{primary, fallbacks}` 对象 |
| 自定义 providers | `models.providers.*` | `config.yaml` → `custom_providers` | 映射 `baseUrl`、`apiType`/`api`，同时处理短格式（如 "openai"、"anthropic"）和带连字符格式（如 "openai-completions"、"anthropic-messages"、"google-generative-ai"） |
| Provider API keys | `models.providers.*.apiKey` | `~/.hermes/.env` | 需要 `--migrate-secrets`，见下方 [API key resolution](#api-key-resolution)。 |

### Agent 行为

| 内容 | OpenClaw config path | Hermes config path | 映射方式 |
|------|---------------------|-------------------|---------|
| Max turns | `agents.defaults.timeoutSeconds` | `agent.max_turns` | `timeoutSeconds / 10`，最多 200 |
| Verbose mode | `agents.defaults.verboseDefault` | `agent.verbose` | "off" / "on" / "full" |
| Reasoning effort | `agents.defaults.thinkingDefault` | `agent.reasoning_effort` | "always"/"high"/"xhigh" → "high"，"auto"/"medium"/"adaptive" → "medium"，"off"/"low"/"none"/"minimal" → "low" |
| Compression | `agents.defaults.compaction.mode` | `compression.enabled` | "off" → false，其他值 → true |
| Compression model | `agents.defaults.compaction.model` | `compression.summary_model` | 字符串直接复制 |
| Human delay | `agents.defaults.humanDelay.mode` | `human_delay.mode` | "natural" / "custom" / "off" |
| Human delay timing | `agents.defaults.humanDelay.minMs` / `.maxMs` | `human_delay.min_ms` / `.max_ms` | 直接复制 |
| Timezone | `agents.defaults.userTimezone` | `timezone` | 直接复制 |
| Exec timeout | `tools.exec.timeoutSec` | `terminal.timeout` | 直接复制，字段名是 `timeoutSec` 而不是 `timeout` |
| Docker sandbox | `agents.defaults.sandbox.backend` | `terminal.backend` | "docker" → "docker" |
| Docker image | `agents.defaults.sandbox.docker.image` | `terminal.docker_image` | 直接复制 |

### 会话重置策略

| OpenClaw config path | Hermes config path | 备注 |
|---------------------|-------------------|-------|
| `session.reset.mode` | `session_reset.mode` | "daily"、"idle" 或两者 |
| `session.reset.atHour` | `session_reset.at_hour` | 每日重置小时（0-23） |
| `session.reset.idleMinutes` | `session_reset.idle_minutes` | 空闲分钟数 |

注意：OpenClaw 还可能有 `session.resetTriggers`（例如 `["daily", "idle"]` 这样的字符串数组）。如果没有结构化的 `session.reset`，迁移会回退到从 `resetTriggers` 推断。

### MCP servers

| OpenClaw 字段 | Hermes 字段 | 备注 |
|----------------|-------------|-------|
| `mcp.servers.*.command` | `mcp_servers.*.command` | Stdio transport |
| `mcp.servers.*.args` | `mcp_servers.*.args` | |
| `mcp.servers.*.env` | `mcp_servers.*.env` | |
| `mcp.servers.*.cwd` | `mcp_servers.*.cwd` | |
| `mcp.servers.*.url` | `mcp_servers.*.url` | HTTP/SSE transport |
| `mcp.servers.*.tools.include` | `mcp_servers.*.tools.include` | 工具过滤 |
| `mcp.servers.*.tools.exclude` | `mcp_servers.*.tools.exclude` | |

### TTS（文本转语音）

TTS 设置会从 OpenClaw 配置中的**三个**位置读取，优先级如下：

1. `messages.tts.providers.{provider}.*`（标准位置）
2. 顶层 `talk.providers.{provider}.*`（fallback）
3. 旧版扁平 key：`messages.tts.{provider}.*`

| 内容 | Hermes 目标 |
|------|-------------------|
| Provider name | `config.yaml` → `tts.provider` |
| ElevenLabs voice ID | `config.yaml` → `tts.elevenlabs.voice_id` |
| ElevenLabs model ID | `config.yaml` → `tts.elevenlabs.model_id` |
| OpenAI model | `config.yaml` → `tts.openai.model` |
| OpenAI voice | `config.yaml` → `tts.openai.voice` |
| Edge TTS voice | `config.yaml` → `tts.edge.voice`（OpenClaw 曾把 "edge" 改名为 "microsoft"，两者都能识别） |
| TTS assets | `~/.hermes/tts/`（文件复制） |

### 消息平台

| 平台 | OpenClaw config path | Hermes `.env` 变量 | 备注 |
|----------|---------------------|----------------------|-------|
| Telegram | `channels.telegram.botToken` 或 `.accounts.default.botToken` | `TELEGRAM_BOT_TOKEN` | token 可以是字符串或 [SecretRef](#secretref-handling)，支持 flat 和 accounts 布局。 |
| Telegram | `credentials/telegram-default-allowFrom.json` | `TELEGRAM_ALLOWED_USERS` | 从 `allowFrom[]` 数组逗号拼接 |
| Discord | `channels.discord.token` 或 `.accounts.default.token` | `DISCORD_BOT_TOKEN` | |
| Discord | `channels.discord.allowFrom` 或 `.accounts.default.allowFrom` | `DISCORD_ALLOWED_USERS` | |
| Slack | `channels.slack.botToken` 或 `.accounts.default.botToken` | `SLACK_BOT_TOKEN` | |
| Slack | `channels.slack.appToken` 或 `.accounts.default.appToken` | `SLACK_APP_TOKEN` | |
| Slack | `channels.slack.allowFrom` 或 `.accounts.default.allowFrom` | `SLACK_ALLOWED_USERS` | |
| WhatsApp | `channels.whatsapp.allowFrom` 或 `.accounts.default.allowFrom` | `WHATSAPP_ALLOWED_USERS` | Baileys QR 配对认证，迁移后需要重新配对 |
| Signal | `channels.signal.account` 或 `.accounts.default.account` | `SIGNAL_ACCOUNT` | |
| Signal | `channels.signal.httpUrl` 或 `.accounts.default.httpUrl` | `SIGNAL_HTTP_URL` | |
| Signal | `channels.signal.allowFrom` 或 `.accounts.default.allowFrom` | `SIGNAL_ALLOWED_USERS` | |
| Matrix | `channels.matrix.accessToken` 或 `.accounts.default.accessToken` | `MATRIX_ACCESS_TOKEN` | 使用 `accessToken`，不是 `botToken` |
| Mattermost | `channels.mattermost.botToken` 或 `.accounts.default.botToken` | `MATTERMOST_BOT_TOKEN` | |

### 其他配置

| 内容 | OpenClaw path | Hermes path | 备注 |
|------|-------------|-------------|-------|
| Approval mode | `approvals.exec.mode` | `config.yaml` → `approvals.mode` | "auto"→"off"，"always"→"manual"，"smart"→"smart" |
| Command allowlist | `exec-approvals.json` | `config.yaml` → `command_allowlist` | 合并并去重 patterns |
| Browser CDP URL | `browser.cdpUrl` | `config.yaml` → `browser.cdp_url` | |
| Browser headless | `browser.headless` | `config.yaml` → `browser.headless` | |
| Brave search key | `tools.web.search.brave.apiKey` | `.env` → `BRAVE_API_KEY` | 需要 `--migrate-secrets` |
| Gateway auth token | `gateway.auth.token` | `.env` → `HERMES_GATEWAY_TOKEN` | 需要 `--migrate-secrets` |
| Working directory | `agents.defaults.workspace` | `.env` → `MESSAGING_CWD` | |

### 归档内容（没有直接 Hermes 等价物）

这些内容会保存到 `~/.hermes/migration/openclaw/<timestamp>/archive/`，供你手动检查：

| 内容 | 归档文件 | 在 Hermes 中如何重建 |
|------|-------------|--------------------------|
| `IDENTITY.md` | `archive/workspace/IDENTITY.md` | 合并到 `SOUL.md` |
| `TOOLS.md` | `archive/workspace/TOOLS.md` | Hermes 已内置工具说明 |
| `HEARTBEAT.md` | `archive/workspace/HEARTBEAT.md` | 使用 cron jobs 做周期任务 |
| `BOOTSTRAP.md` | `archive/workspace/BOOTSTRAP.md` | 使用上下文文件或 skills |
| Cron jobs | `archive/cron-config.json` | 用 `hermes cron create` 重建 |
| Plugins | `archive/plugins-config.json` | 见 [plugins guide](/docs/user-guide/features/hooks) |
| Hooks/webhooks | `archive/hooks-config.json` | 使用 `hermes webhook` 或 gateway hooks |
| Memory backend | `archive/memory-backend-config.json` | 通过 `hermes honcho` 配置 |
| Skills registry | `archive/skills-registry-config.json` | 使用 `hermes skills config` |
| UI/identity | `archive/ui-identity-config.json` | 使用 `/skin` 命令 |
| Logging | `archive/logging-diagnostics-config.json` | 在 `config.yaml` 的 logging section 中设置 |
| Multi-agent list | `archive/agents-list.json` | 使用 Hermes profiles |
| Channel bindings | `archive/bindings.json` | 按平台手动设置 |
| Complex channels | `archive/channels-deep-config.json` | 手动配置平台 |

## API key resolution

启用 `--migrate-secrets` 后，API keys 会按优先级从**四个来源**收集：

1. **配置值**：`openclaw.json` 中的 `models.providers.*.apiKey` 和 TTS provider keys
2. **环境文件**：`~/.openclaw/.env`（例如 `OPENROUTER_API_KEY`、`ANTHROPIC_API_KEY`）
3. **配置中的 env 子对象**：`openclaw.json` → `"env"` 或 `"env"."vars"`（有些安装会把 key 放这里）
4. **Auth profiles**：`~/.openclaw/agents/main/agent/auth-profiles.json`（按 agent 存储的凭据）

配置值优先级最高，后续来源只会填补还缺失的 key。

### 支持的 key 目标

`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `ZAI_API_KEY`, `MINIMAX_API_KEY`, `ELEVENLABS_API_KEY`, `TELEGRAM_BOT_TOKEN`, `VOICE_TOOLS_OPENAI_KEY`

不在这个 allowlist 中的 key 不会被复制。

## SecretRef handling

OpenClaw 配置中的 token 和 API key 可能有三种形式：

```json
// Plain string
"channels": { "telegram": { "botToken": "123456:ABC-DEF..." } }

// Environment template
"channels": { "telegram": { "botToken": "${TELEGRAM_BOT_TOKEN}" } }

// SecretRef object
"channels": { "telegram": { "botToken": { "source": "env", "id": "TELEGRAM_BOT_TOKEN" } } }
```

迁移会解析这三种格式。对于 env template 和 `source: "env"` 的 SecretRef 对象，它会从 `~/.openclaw/.env` 和 `openclaw.json` 的 env 子对象中查找真实值。`source: "file"` 或 `source: "exec"` 的 SecretRef 无法自动解析，迁移会给出警告，你需要之后用 `hermes config set` 手动补到 Hermes。

## 迁移后检查

1. **检查迁移报告**：完成后会打印迁移、跳过和冲突项数量。

2. **检查归档文件**：`~/.hermes/migration/openclaw/<timestamp>/archive/` 中的内容都需要你手动确认。

3. **开启新会话**：导入的 skills 和 memory 条目会在新会话中生效，不会影响当前会话。

4. **验证 API keys**：运行 `hermes status` 检查 provider 认证状态。

5. **测试消息平台**：如果迁移了平台 token，请重启 gateway：`systemctl --user restart hermes-gateway`

6. **检查会话策略**：确认 `hermes config get session_reset` 与预期一致。

7. **重新配对 WhatsApp**：WhatsApp 使用 QR code 配对（Baileys），无法直接迁移 token。运行 `hermes whatsapp` 重新配对。

8. **清理归档**：确认一切正常后，运行 `hermes claw cleanup`，把剩余 OpenClaw 目录重命名为 `.pre-migration/`，避免状态混淆。

## 故障排查

### “OpenClaw directory not found”

迁移会依次检查 `~/.openclaw/`、`~/.clawdbot/`、`~/.moltbot/`。如果你的安装在别处，请使用 `--source /path/to/your/openclaw`。

### “No provider API keys found”

根据 OpenClaw 版本不同，keys 可能存放在多个位置：`openclaw.json` 中的 `models.providers.*.apiKey`、`~/.openclaw/.env`、`openclaw.json` 的 `"env"` 子对象，或 `agents/main/agent/auth-profiles.json`。迁移会检查这四处。如果 key 使用 `source: "file"` 或 `source: "exec"` 的 SecretRef，就无法自动解析，需要通过 `hermes config set` 手动添加。

### 迁移后看不到 Skills

导入的 skills 会放到 `~/.hermes/skills/openclaw-imports/`。请开启新会话让它们生效，或运行 `/skills` 检查是否已加载。

### TTS voice 没有迁移

OpenClaw 会把 TTS 设置放在两个位置：`messages.tts.providers.*` 和顶层 `talk` 配置。迁移会检查两处。如果你的 voice ID 是通过 OpenClaw UI 设置并保存在其他路径，可能需要手动设置：`hermes config set tts.elevenlabs.voice_id YOUR_VOICE_ID`。
