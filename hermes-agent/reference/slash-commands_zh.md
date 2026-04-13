---
sidebar_position: 2
title: "斜杠命令参考"
description: "交互式 CLI 与消息平台斜杠命令完整参考"
---

# 斜杠命令参考

Hermes 有两套斜杠命令入口，二者都由 `hermes_cli/commands.py` 中统一的 `COMMAND_REGISTRY` 驱动：

- **交互式 CLI 斜杠命令**：由 `cli.py` 分发，并基于注册表提供自动补全
- **消息平台斜杠命令**：由 `gateway/run.py` 分发，并依据注册表生成帮助文本和平台菜单

已安装的技能也会在这两个入口中作为动态斜杠命令暴露出来。其中包括 `/plan` 这样的内置技能，它会进入 plan mode，并将 markdown 计划保存到相对于当前工作区或后端工作目录的 `.hermes/plans/` 下。

## 交互式 CLI 斜杠命令

在 CLI 中输入 `/` 可打开自动补全菜单。内置命令不区分大小写。

### Session

| 命令 | 说明 |
|---------|-------------|
| `/new`（别名：`/reset`） | 开启一个新会话（全新 session ID 与历史） |
| `/clear` | 清屏并开启新会话 |
| `/history` | 显示对话历史 |
| `/save` | 保存当前对话 |
| `/retry` | 重试上一条消息（重新发送给 agent） |
| `/undo` | 删除上一轮用户 / assistant 往返 |
| `/title` | 设置当前会话标题（用法：`/title 我的会话名`） |
| `/compress` | 手动压缩上下文（刷新记忆并生成摘要） |
| `/rollback` | 列出或恢复文件系统检查点（用法：`/rollback [number]`） |
| `/stop` | 终止所有后台进程 |
| `/queue <prompt>`（别名：`/q`） | 把提示排到下一轮，不会打断当前 agent 回复。**注意：**`/q` 同时被 `/queue` 和 `/quit` 占用，最终以后注册者为准，因此实际会解析成 `/quit`。请显式使用 `/queue`。 |
| `/resume [name]` | 恢复一个已命名会话 |
| `/statusbar`（别名：`/sb`） | 打开或关闭上下文 / 模型状态栏 |
| `/background <prompt>`（别名：`/bg`） | 在独立后台会话中运行提示。agent 会独立处理该任务，当前会话可继续做别的事。任务结束后会以面板形式返回结果。参见 [CLI 后台会话](/docs/user-guide/cli#background-sessions)。 |
| `/btw <question>` | 使用当前会话上下文提出一个临时支线问题（不使用工具、也不会持久化）。适合快速澄清，不影响主对话历史。 |
| `/plan [request]` | 加载内置 `plan` 技能，生成 markdown 计划而不直接执行工作。计划保存到相对于当前工作区 / 后端工作目录的 `.hermes/plans/` 下。 |
| `/branch [name]`（别名：`/fork`） | 从当前会话分叉，探索另一条路径 |

### Configuration

| 命令 | 说明 |
|---------|-------------|
| `/config` | 显示当前配置 |
| `/model [model-name]` | 查看或切换当前模型。支持：`/model claude-sonnet-4`、`/model provider:model`（切换 provider）、`/model custom:model`（自定义端点）、`/model custom:name:model`（命名的自定义 provider）、`/model custom`（自动检测端点模型） |
| `/provider` | 显示可用 provider 和当前 provider |
| `/personality` | 设置预定义人格 |
| `/verbose` | 循环切换工具进度显示：`off → new → all → verbose`。也可以通过配置为消息平台启用。 |
| `/reasoning` | 管理推理强度与显示方式（用法：`/reasoning [level\|show\|hide]`） |
| `/skin` | 查看或切换显示皮肤 / 主题 |
| `/voice [on\|off\|tts\|status]` | 切换 CLI 语音模式与语音播报。录音按键使用 `voice.record_key`（默认 `Ctrl+B`）。 |
| `/yolo` | 切换 YOLO 模式，跳过所有危险命令审批提示。 |

### Tools & Skills

| 命令 | 说明 |
|---------|-------------|
| `/tools [list\|disable\|enable] [name...]` | 管理工具：列出可用工具，或为当前会话启用 / 禁用特定工具。禁用某个工具会把它从 agent 工具集中移除，并触发一次会话重置。 |
| `/toolsets` | 列出可用工具集 |
| `/browser [connect\|disconnect\|status]` | 管理本地 Chrome CDP 连接。`connect` 会把浏览器工具附着到运行中的 Chrome（默认 `ws://localhost:9222`）；`disconnect` 断开；`status` 显示当前连接状态。如果未检测到 debugger，会自动启动 Chrome。 |
| `/skills` | 在线搜索、安装、查看和管理技能 |
| `/cron` | 管理定时任务（list、add/create、edit、pause、resume、run、remove） |
| `/reload-mcp`（别名：`/reload_mcp`） | 从 `config.yaml` 重新加载 MCP 服务器 |
| `/plugins` | 列出已安装插件及其状态 |

### Info

| 命令 | 说明 |
|---------|-------------|
| `/help` | 显示帮助信息 |
| `/usage` | 显示 token 用量、成本明细和会话时长 |
| `/insights` | 显示使用洞察和分析（最近 30 天） |
| `/platforms`（别名：`/gateway`） | 显示 gateway / 消息平台状态 |
| `/paste` | 检查剪贴板中的图片并附加 |
| `/profile` | 显示当前激活的 profile 名称与 home 目录 |

### Exit

| 命令 | 说明 |
|---------|-------------|
| `/quit` | 退出 CLI（也可用 `/exit`）。关于 `/q` 的说明见前文 `/queue`。 |

### 动态 CLI 斜杠命令

| 命令 | 说明 |
|---------|-------------|
| `/<skill-name>` | 把任意已安装技能作为按需命令加载。例如：`/gif-search`、`/github-pr-workflow`、`/excalidraw`。 |
| `/skills ...` | 从注册表和官方 optional-skills 目录中搜索、浏览、查看、安装、审计、发布和配置技能。 |

### Quick Commands

用户自定义 quick command 可以把一个简短别名映射到更长的提示词。在 `~/.hermes/config.yaml` 中配置：

```yaml
quick_commands:
  review: "Review my latest git diff and suggest improvements"
  deploy: "Run the deployment script at scripts/deploy.sh and verify the output"
  morning: "Check my calendar, unread emails, and summarize today's priorities"
```

之后在 CLI 中直接输入 `/review`、`/deploy` 或 `/morning` 即可。Quick command 在分发时解析，不会显示在内置自动补全 / 帮助表格中。

### Alias Resolution

命令支持前缀匹配：输入 `/h` 会解析成 `/help`，输入 `/mod` 会解析成 `/model`。如果前缀有歧义（匹配多个命令），则以注册表顺序中的第一个匹配为准。完整命令名和显式注册的别名始终优先于前缀匹配。

## 消息平台斜杠命令

消息 gateway 在 Telegram、Discord、Slack、WhatsApp、Signal、Email 和 Home Assistant 聊天中支持以下内置命令：

| 命令 | 说明 |
|---------|-------------|
| `/new` | 开始新的对话。 |
| `/reset` | 重置对话历史。 |
| `/status` | 显示会话信息。 |
| `/stop` | 杀掉所有后台进程并打断当前运行中的 agent。 |
| `/model [provider:model]` | 查看或切换模型。支持 provider 切换（`/model zai:glm-5`）、自定义端点（`/model custom:model`）、命名的自定义 provider（`/model custom:local:qwen`）以及自动检测（`/model custom`）。 |
| `/provider` | 显示 provider 可用性与认证状态。 |
| `/personality [name]` | 为当前会话设置人格叠加层。 |
| `/retry` | 重试上一条消息。 |
| `/undo` | 删除上一轮往返。 |
| `/sethome`（别名：`/set-home`） | 将当前聊天标记为该平台的 home channel，用于消息投递。 |
| `/compress` | 手动压缩会话上下文。 |
| `/title [name]` | 设置或显示会话标题。 |
| `/resume [name]` | 恢复一个已命名会话。 |
| `/usage` | 显示 token 用量、预估成本明细（输入 / 输出）、上下文窗口状态与会话时长。 |
| `/insights [days]` | 显示使用分析。 |
| `/reasoning [level\|show\|hide]` | 调整推理强度或切换推理显示。 |
| `/voice [on\|off\|tts\|join\|channel\|leave\|status]` | 控制聊天中的语音回复。`join` / `channel` / `leave` 用于管理 Discord 语音频道模式。 |
| `/rollback [number]` | 列出或恢复文件系统检查点。 |
| `/background <prompt>` | 在独立后台会话中运行提示。任务完成后，结果会回传到同一聊天。参见 [消息后台会话](/docs/user-guide/messaging/#background-sessions)。 |
| `/plan [request]` | 加载内置 `plan` 技能，生成 markdown 计划而不是直接执行工作。计划保存到相对于当前工作区 / 后端工作目录的 `.hermes/plans/` 下。 |
| `/reload-mcp`（别名：`/reload_mcp`） | 从配置中重新加载 MCP 服务器。 |
| `/yolo` | 切换 YOLO 模式，跳过所有危险命令审批提示。 |
| `/commands [page]` | 分页浏览全部命令与技能。 |
| `/approve [session\|always]` | 批准并执行一条待确认的危险命令。`session` 只对当前会话生效；`always` 会加入永久允许列表。 |
| `/deny` | 拒绝一条待确认的危险命令。 |
| `/update` | 将 Hermes Agent 更新到最新版本。 |
| `/help` | 显示消息平台帮助。 |
| `/<skill-name>` | 按名字调用任意已安装技能。 |

## Notes

- `/skin`、`/tools`、`/toolsets`、`/browser`、`/config`、`/cron`、`/skills`、`/platforms`、`/paste`、`/statusbar` 和 `/plugins` 是 **仅 CLI 可用** 的命令。
- `/verbose` **默认仅 CLI 可用**，但可通过在 `config.yaml` 中设置 `display.tool_progress_command: true` 为消息平台启用。启用后，它会循环切换 `display.tool_progress` 模式，并保存到配置中。
- `/status`、`/sethome`、`/update`、`/approve`、`/deny` 和 `/commands` 是 **仅消息平台可用** 的命令。
- `/background`、`/voice`、`/reload-mcp`、`/rollback` 和 `/yolo` 在 **CLI 与消息 gateway** 中都可用。
- `/voice join`、`/voice channel` 和 `/voice leave` 仅在 Discord 中有意义。
