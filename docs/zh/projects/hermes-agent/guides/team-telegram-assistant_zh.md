---
title: "教程：团队 Telegram 助手"
description: "逐步搭建一个整个团队都能使用的 Telegram 机器人，用于代码协助、研究、系统管理等场景"
---

# 搭建团队 Telegram 助手

这篇教程会带你搭建一个由 Hermes Agent 驱动的 Telegram 机器人，让多个团队成员都能使用。完成后，你的团队会拥有一个共享 AI 助手，可以用它做代码协助、研究、系统管理等工作，并通过按用户授权保证安全。

## 我们要搭建什么

一个 Telegram 机器人，具备这些能力：

- **任何已授权团队成员**都可以私聊它获取帮助，例如代码审查、研究、shell 命令和调试
- **运行在你的服务器上**，拥有完整工具访问能力，包括终端、文件编辑、网页搜索和代码执行
- **按用户隔离会话**，每个人都有自己的对话上下文
- **默认安全**，只有被批准的用户可以交互，并支持两种授权方式
- **定时任务**，可以把每日站会、健康检查和提醒发送到团队频道

---

## 前置条件

开始前，请确认你已经有：

- **安装在服务器或 VPS 上的 Hermes Agent**。不要只装在笔记本上，因为机器人需要持续运行。还没安装的话，请先看 [安装指南](/docs/getting-started/installation)。
- **你自己的 Telegram 账号**，作为机器人 owner
- **已配置 LLM provider**，至少需要在 `~/.hermes/.env` 中配置 OpenAI、Anthropic 或其他支持 provider 的 API key

:::tip
每月 5 美元左右的 VPS 就足够运行 gateway。Hermes 本身很轻量，真正产生费用的是远程 LLM API 调用。
:::

---

## 第 1 步：创建 Telegram Bot

每个 Telegram 机器人都从 **@BotFather** 开始，它是 Telegram 官方用来创建机器人的 bot。

1. **打开 Telegram**，搜索 `@BotFather`，或访问 [t.me/BotFather](https://t.me/BotFather)

2. **发送 `/newbot`**。BotFather 会问你两个问题：
   - **显示名称**：用户看到的名字，例如 `Team Hermes Assistant`
   - **用户名**：必须以 `bot` 结尾，例如 `myteam_hermes_bot`

3. **复制 bot token**。BotFather 会返回类似内容：
   ```
   Use this token to access the HTTP API:
   7123456789:AAH1bGciOiJSUzI1NiIsInR5cCI6Ikp...
   ```
   保存这个 token，下一步会用到。

4. **设置描述**（可选但推荐）：
   ```
   /setdescription
   ```
   选择你的 bot，然后输入类似内容：
   ```
   Team AI assistant powered by Hermes Agent. DM me for help with code, research, debugging, and more.
   ```

5. **设置 bot 命令**（可选，会给用户一个命令菜单）：
   ```
   /setcommands
   ```
   选择你的 bot，然后粘贴：
   ```
   new - Start a fresh conversation
   model - Show or change the AI model
   status - Show session info
   help - Show available commands
   stop - Stop the current task
   ```

:::warning
请妥善保管 bot token。任何拿到 token 的人都能控制你的机器人。如果 token 泄漏，请在 BotFather 中使用 `/revoke` 生成新 token。
:::

---

## 第 2 步：配置 Gateway

你有两种选择：使用交互式配置向导（推荐），或手动配置。

### 方式 A：交互式配置（推荐）

```bash
hermes gateway setup
```

这个命令会用方向键选择的方式带你完成配置。选择 **Telegram**，粘贴 bot token，然后在提示时输入你的用户 ID。

### 方式 B：手动配置

把下面内容添加到 `~/.hermes/.env`：

```bash
# Telegram bot token from BotFather
TELEGRAM_BOT_TOKEN=7123456789:AAH1bGciOiJSUzI1NiIsInR5cCI6Ikp...

# Your Telegram user ID (numeric)
TELEGRAM_ALLOWED_USERS=123456789
```

### 查找你的用户 ID

Telegram 用户 ID 是一个数字，不是你的用户名。获取方式：

1. 在 Telegram 上私聊 [@userinfobot](https://t.me/userinfobot)
2. 它会立刻返回你的数字 user ID
3. 把这个数字填到 `TELEGRAM_ALLOWED_USERS`

:::info
Telegram user ID 是类似 `123456789` 的永久数字，和可修改的 `@username` 不同。allowlist 中始终应该使用数字 ID。
:::

---

## 第 3 步：启动 Gateway

### 快速测试

先在前台运行 gateway，确认一切正常：

```bash
hermes gateway
```

你应该看到类似输出：

```
[Gateway] Starting Hermes Gateway...
[Gateway] Telegram adapter connected
[Gateway] Cron scheduler started (tick every 60s)
```

打开 Telegram，找到你的 bot，发一条消息。如果它能回复，就说明配置成功。按 `Ctrl+C` 停止。

### 生产环境：安装为服务

为了持久运行并支持重启后自动恢复：

```bash
hermes gateway install
sudo hermes gateway install --system   # Linux only: boot-time system service
```

这会创建一个后台服务：Linux 默认是用户级 **systemd** 服务，macOS 是 **launchd** 服务；如果传入 `--system`，则会创建 Linux 系统级开机服务。

```bash
# Linux — manage the default user service
hermes gateway start
hermes gateway stop
hermes gateway status

# View live logs
journalctl --user -u hermes-gateway -f

# Keep running after SSH logout
sudo loginctl enable-linger $USER

# Linux servers — explicit system-service commands
sudo hermes gateway start --system
sudo hermes gateway status --system
journalctl -u hermes-gateway -f
```

```bash
# macOS — manage the service
hermes gateway start
hermes gateway stop
tail -f ~/.hermes/logs/gateway.log
```

:::tip macOS PATH
launchd plist 会在安装时捕获你的 shell PATH，这样 gateway 的子进程才能找到 Node.js、ffmpeg 等工具。如果你后面又安装了新工具，请重新运行 `hermes gateway install` 更新 plist。
:::

### 确认它正在运行

```bash
hermes gateway status
```

然后在 Telegram 里给 bot 发一条测试消息。你应该在几秒内收到回复。

---

## 第 4 步：配置团队访问

现在可以让队友加入了。有两种方式。

### 方式 A：静态 Allowlist

收集团队成员的 Telegram user ID（让他们私聊 [@userinfobot](https://t.me/userinfobot)），然后写成逗号分隔列表：

```bash
# In ~/.hermes/.env
TELEGRAM_ALLOWED_USERS=123456789,987654321,555555555
```

修改后重启 gateway：

```bash
hermes gateway stop && hermes gateway start
```

### 方式 B：DM Pairing（团队推荐）

DM pairing 更灵活，你不需要提前收集用户 ID。流程如下：

1. **队友私聊 bot**。因为他们还不在 allowlist 中，bot 会返回一次性配对码：
   ```
   🔐 Pairing code: XKGH5N7P
   Send this code to the bot owner for approval.
   ```

2. **队友把配对码发给你**，通过 Slack、邮件或当面都可以

3. **你在服务器上审批**：
   ```bash
   hermes pairing approve telegram XKGH5N7P
   ```

4. **他们即可使用**。bot 会立刻开始响应他们的消息

**管理已配对用户：**

```bash
# See all pending and approved users
hermes pairing list

# Revoke someone's access
hermes pairing revoke telegram 987654321

# Clear expired pending codes
hermes pairing clear-pending
```

:::tip
DM pairing 很适合团队使用，因为新增用户时不需要重启 gateway，审批会立即生效。
:::

### 安全注意事项

- **永远不要在带终端访问能力的 bot 上设置 `GATEWAY_ALLOW_ALL_USERS=true`**，否则任何找到 bot 的人都可能在你的服务器上运行命令
- 配对码 1 小时后过期，并使用密码学随机数生成
- 速率限制会防止暴力破解：每个用户每 10 分钟 1 次请求，每个平台最多 3 个待审批码
- 连续 5 次审批失败后，该平台会进入 1 小时锁定
- 所有 pairing 数据都会以 `chmod 0600` 权限保存

---

## 第 5 步：配置 Bot

### 设置 Home Channel

**Home channel** 是 bot 投递 cron 结果和主动消息的位置。如果不设置，定时任务就没有地方发送输出。

**方式 1：** 在 bot 所在的任意 Telegram 群组或聊天中使用 `/sethome`。

**方式 2：** 在 `~/.hermes/.env` 中手动设置：

```bash
TELEGRAM_HOME_CHANNEL=-1001234567890
TELEGRAM_HOME_CHANNEL_NAME="Team Updates"
```

要获取群组 ID，可以把 [@userinfobot](https://t.me/userinfobot) 加入群组，它会报告群组 chat ID。

### 配置工具进度显示

在 `~/.hermes/config.yaml` 中控制 bot 使用工具时显示多少细节：

```yaml
display:
  tool_progress: new    # off | new | all | verbose
```

| 模式 | 你会看到什么 |
|------|-------------|
| `off` | 只看干净回复，不显示工具活动 |
| `new` | 每个新工具调用显示简短状态（消息平台推荐） |
| `all` | 显示所有工具调用及细节 |
| `verbose` | 显示完整工具输出，包括命令结果 |

用户也可以在聊天中用 `/verbose` 按会话调整。

### 用 SOUL.md 设置人格

通过编辑 `~/.hermes/SOUL.md` 可以定制 bot 的沟通风格。

完整指南见 [Use SOUL.md with Hermes](/docs/guides/use-soul-with-hermes)。

```markdown
# Soul
You are a helpful team assistant. Be concise and technical.
Use code blocks for any code. Skip pleasantries — the team
values directness. When debugging, always ask for error logs
before guessing at solutions.
```

### 添加项目上下文

如果团队围绕固定项目工作，可以创建上下文文件，让 bot 了解技术栈：

```markdown
<!-- ~/.hermes/AGENTS.md -->
# Team Context
- We use Python 3.12 with FastAPI and SQLAlchemy
- Frontend is React with TypeScript
- CI/CD runs on GitHub Actions
- Production deploys to AWS ECS
- Always suggest writing tests for new code
```

:::info
上下文文件会注入每次会话的 system prompt。请保持简洁，因为每个字符都会消耗 token 预算。
:::

---

## 第 6 步：设置定时任务

Gateway 运行后，你就可以安排周期性任务，把结果发送到团队频道。

### 每日站会摘要

在 Telegram 中给 bot 发：

```
Every weekday at 9am, check the GitHub repository at
github.com/myorg/myproject for:
1. Pull requests opened/merged in the last 24 hours
2. Issues created or closed
3. Any CI/CD failures on the main branch
Format as a brief standup-style summary.
```

Agent 会自动创建 cron 任务，并把结果投递到你发起请求的聊天，或 home channel。

### 服务器健康检查

```
Every 6 hours, check disk usage with 'df -h', memory with 'free -h',
and Docker container status with 'docker ps'. Report anything unusual —
partitions above 80%, containers that have restarted, or high memory usage.
```

### 管理定时任务

```bash
# From the CLI
hermes cron list          # View all scheduled jobs
hermes cron status        # Check if scheduler is running

# From Telegram chat
/cron list                # View jobs
/cron remove <job_id>     # Remove a job
```

:::warning
Cron 任务提示词会在完全全新的会话中运行，不会记得之前的对话。请确保每个提示词都包含 Agent 所需的**全部**上下文，例如文件路径、URL、服务器地址和明确指令。
:::

---

## 生产环境建议

### 用 Docker 做安全边界

对于共享团队 bot，建议使用 Docker 作为终端后端，让 Agent 命令运行在容器中，而不是直接运行在宿主机上：

```bash
# In ~/.hermes/.env
TERMINAL_BACKEND=docker
TERMINAL_DOCKER_IMAGE=nikolaik/python-nodejs:python3.11-nodejs20
```

或者在 `~/.hermes/config.yaml` 中：

```yaml
terminal:
  backend: docker
  container_cpu: 1
  container_memory: 5120
  container_persistent: true
```

这样即便有人让 bot 执行破坏性命令，宿主机也会受到保护。

### 监控 Gateway

```bash
# Check if the gateway is running
hermes gateway status

# Watch live logs (Linux)
journalctl --user -u hermes-gateway -f

# Watch live logs (macOS)
tail -f ~/.hermes/logs/gateway.log
```

### 保持 Hermes 更新

在 Telegram 中向 bot 发送 `/update`，它会拉取最新版本并重启。或者在服务器上执行：

```bash
hermes update
hermes gateway stop && hermes gateway start
```

### 日志位置

| 内容 | 位置 |
|------|----------|
| Gateway logs | `journalctl --user -u hermes-gateway`（Linux）或 `~/.hermes/logs/gateway.log`（macOS） |
| Cron job output | `~/.hermes/cron/output/{job_id}/{timestamp}.md` |
| Cron job definitions | `~/.hermes/cron/jobs.json` |
| Pairing data | `~/.hermes/pairing/` |
| Session history | `~/.hermes/sessions/` |

---

## 更进一步

你现在已经拥有一个可用的团队 Telegram 助手。接下来可以继续看：

- **[Security Guide](/docs/user-guide/security)**：授权、容器隔离和命令审批的深入说明
- **[Messaging Gateway](/docs/user-guide/messaging)**：gateway 架构、会话管理和聊天命令完整参考
- **[Telegram Setup](/docs/user-guide/messaging/telegram)**：Telegram 特定细节，包括语音消息和 TTS
- **[Scheduled Tasks](/docs/user-guide/features/cron)**：更高级的 cron 调度、投递选项和 cron 表达式
- **[Context Files](/docs/user-guide/features/context-files)**：AGENTS.md、SOUL.md 和 .cursorrules
- **[Personality](/docs/user-guide/features/personality)**：内置人格预设和自定义 persona
- **添加更多平台**：同一个 gateway 可以同时运行 [Discord](/docs/user-guide/messaging/discord)、[Slack](/docs/user-guide/messaging/slack) 和 [WhatsApp](/docs/user-guide/messaging/whatsapp)

---

*如果有问题或疑问，欢迎在 GitHub 上开 issue，社区贡献始终欢迎。*
