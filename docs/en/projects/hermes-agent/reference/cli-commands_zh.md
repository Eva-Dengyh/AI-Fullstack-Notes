---
sidebar_position: 1
title: "CLI 命令参考"
description: "Hermes 终端命令与命令族的权威参考"
---

# CLI 命令参考

本页介绍你在 shell 中运行的 **终端命令**。

聊天内斜杠命令请参见 [斜杠命令参考](./slash-commands_zh.md)。

## 全局入口

```bash
hermes [global-options] <command> [subcommand/options]
```

### 全局选项

| 选项 | 说明 |
|--------|-------------|
| `--version`, `-V` | 显示版本并退出。 |
| `--profile <name>`, `-p <name>` | 指定本次调用使用哪个 Hermes profile。会覆盖 `hermes profile use` 设置的粘性默认值。 |
| `--resume <session>`, `-r <session>` | 按 ID 或标题恢复之前的会话。 |
| `--continue [name]`, `-c [name]` | 恢复最近一次会话，或最近一次与指定标题匹配的会话。 |
| `--worktree`, `-w` | 在隔离的 git worktree 中启动，适合并行 agent 工作流。 |
| `--yolo` | 跳过危险命令审批提示。 |
| `--pass-session-id` | 将 session ID 注入 agent 的系统提示中。 |

## 顶层命令

| 命令 | 用途 |
|---------|---------|
| `hermes chat` | 与 agent 进行交互式或一次性对话。 |
| `hermes model` | 交互式选择默认 provider 与模型。 |
| `hermes gateway` | 运行或管理消息 gateway 服务。 |
| `hermes setup` | 交互式初始化向导，可配置全部或部分设置。 |
| `hermes whatsapp` | 配置并配对 WhatsApp bridge。 |
| `hermes auth` | 管理凭据：添加、列出、移除、重置、设置策略。处理 Codex / Nous / Anthropic 的 OAuth 流程。 |
| `hermes login` / `logout` | **已弃用**，请改用 `hermes auth`。 |
| `hermes status` | 显示 agent、认证与平台状态。 |
| `hermes cron` | 查看和驱动 cron 调度器。 |
| `hermes webhook` | 管理用于事件驱动激活的动态 webhook 订阅。 |
| `hermes doctor` | 诊断配置和依赖问题。 |
| `hermes dump` | 输出适合复制粘贴的环境摘要，用于支持和调试。 |
| `hermes logs` | 查看、追踪和过滤 agent / gateway / error 日志文件。 |
| `hermes config` | 查看、编辑、迁移和查询配置文件。 |
| `hermes pairing` | 批准或撤销消息平台配对码。 |
| `hermes skills` | 浏览、安装、发布、审计和配置技能。 |
| `hermes honcho` | 管理 Honcho 跨会话记忆集成。 |
| `hermes memory` | 配置外部记忆 provider。 |
| `hermes acp` | 将 Hermes 作为 ACP 服务器运行，用于编辑器集成。 |
| `hermes mcp` | 管理 MCP 服务器配置，或将 Hermes 作为 MCP 服务器运行。 |
| `hermes plugins` | 管理 Hermes Agent 插件（安装、启用、禁用、移除）。 |
| `hermes tools` | 按平台配置启用的工具。 |
| `hermes sessions` | 浏览、导出、裁剪、重命名与删除会话。 |
| `hermes insights` | 显示 token / 成本 / 活跃度分析。 |
| `hermes claw` | OpenClaw 迁移辅助命令。 |
| `hermes profile` | 管理 profiles，即多个彼此隔离的 Hermes 实例。 |
| `hermes completion` | 输出 shell 自动补全脚本（bash / zsh）。 |
| `hermes version` | 显示版本信息。 |
| `hermes update` | 拉取最新代码并重装依赖。 |
| `hermes uninstall` | 从系统中移除 Hermes。 |

## `hermes chat`

```bash
hermes chat [options]
```

常用选项：

| 选项 | 说明 |
|--------|-------------|
| `-q`, `--query "..."` | 一次性非交互式提示。 |
| `-m`, `--model <model>` | 覆盖本次运行使用的模型。 |
| `-t`, `--toolsets <csv>` | 启用以逗号分隔的工具集。 |
| `--provider <provider>` | 强制指定 provider：`auto`、`openrouter`、`nous`、`openai-codex`、`copilot-acp`、`copilot`、`anthropic`、`huggingface`、`zai`、`kimi-coding`、`minimax`、`minimax-cn`、`deepseek`、`ai-gateway`、`opencode-zen`、`opencode-go`、`kilocode`、`xiaomi`、`alibaba`。 |
| `-s`, `--skills <name>` | 为当前会话预加载一个或多个技能（可重复传入，也可逗号分隔）。 |
| `-v`, `--verbose` | 输出详细信息。 |
| `-Q`, `--quiet` | 程序化模式：关闭横幅、spinner 和工具预览。 |
| `--resume <session>` / `--continue [name]` | 直接从 `chat` 恢复会话。 |
| `--worktree` | 为本次运行创建隔离 git worktree。 |
| `--checkpoints` | 在破坏性文件变更前启用文件系统检查点。 |
| `--yolo` | 跳过审批提示。 |
| `--pass-session-id` | 将 session ID 传入系统提示。 |
| `--source <tag>` | 会话来源标签，用于过滤（默认 `cli`）。第三方集成可用 `tool`，使其不出现在用户会话列表中。 |
| `--max-turns <N>` | 每轮对话允许的最大工具调用迭代次数（默认 90，也可由 `agent.max_turns` 配置）。 |

示例：

```bash
hermes
hermes chat -q "Summarize the latest PRs"
hermes chat --provider openrouter --model anthropic/claude-sonnet-4.6
hermes chat --toolsets web,terminal,skills
hermes chat --quiet -q "Return only JSON"
hermes chat --worktree -q "Review this repo and open a PR"
```

## `hermes model`

交互式 provider + model 选择器。

```bash
hermes model
```

适用场景：
- 切换默认 provider
- 在选模型时登录 OAuth provider
- 从 provider 专属模型列表中挑选
- 配置自定义 / 自托管端点
- 将新默认值写入配置

### `/model` 斜杠命令（会话中切换）

```text
/model
/model claude-sonnet-4
/model zai:glm-5
/model custom:qwen-2.5
/model custom
/model custom:local:qwen-2.5
/model openrouter:anthropic/claude-sonnet-4
```

provider 与 `base_url` 的变更会自动持久化到 `config.yaml`。从自定义端点切回其他 provider 时，旧 `base_url` 也会被清除，避免误泄漏到其他 provider 配置中。

## `hermes gateway`

```bash
hermes gateway <subcommand>
```

| 子命令 | 说明 |
|------------|-------------|
| `run` | 前台运行 gateway。推荐用于 WSL、Docker 与 Termux。 |
| `start` | 启动已安装的 systemd / launchd 后台服务。 |
| `stop` | 停止服务（或前台进程）。 |
| `restart` | 重启服务。 |
| `status` | 显示服务状态。 |
| `install` | 安装为 systemd（Linux）或 launchd（macOS）后台服务。 |
| `uninstall` | 移除已安装服务。 |
| `setup` | 交互式消息平台设置。 |

:::tip WSL 用户
请优先使用 `hermes gateway run`，而不是 `hermes gateway start`。WSL 的 systemd 支持不稳定。若希望持久运行，可配合 tmux：`tmux new -s hermes 'hermes gateway run'`。详情见 [WSL FAQ](/docs/reference/faq#wsl-gateway-keeps-disconnecting-or-hermes-gateway-start-fails)。
:::

## `hermes setup`

```bash
hermes setup [model|terminal|gateway|tools|agent] [--non-interactive] [--reset]
```

可以运行完整向导，也可以直接跳到某一部分：

| 部分 | 说明 |
|---------|-------------|
| `model` | provider 与模型设置。 |
| `terminal` | 终端后端与沙箱设置。 |
| `gateway` | 消息平台设置。 |
| `tools` | 按平台启用 / 禁用工具。 |
| `agent` | agent 行为设置。 |

| 选项 | 说明 |
|--------|-------------|
| `--non-interactive` | 使用默认值 / 环境变量，不再交互提问。 |
| `--reset` | 在 setup 前先将配置重置为默认值。 |

## `hermes whatsapp`

```bash
hermes whatsapp
```

运行 WhatsApp 配对 / 设置流程，包括模式选择和二维码配对。

## `hermes auth`

用于管理同一 provider 下的凭据池。完整文档参见 [Credential Pools](/docs/user-guide/features/credential-pools)。

```bash
hermes auth
hermes auth list
hermes auth list openrouter
hermes auth add openrouter --api-key sk-or-v1-xxx
hermes auth add anthropic --type oauth
hermes auth remove openrouter 2
hermes auth reset openrouter
```

子命令包括：`add`、`list`、`remove`、`reset`。不带子命令时会启动交互式管理向导。

## `hermes status`

```bash
hermes status [--all] [--deep]
```

| 选项 | 说明 |
|--------|-------------|
| `--all` | 以适合分享、已脱敏的格式显示全部细节。 |
| `--deep` | 执行更深层检查，耗时可能更长。 |

## `hermes cron`

```bash
hermes cron <list|create|edit|pause|resume|run|remove|status|tick>
```

| 子命令 | 说明 |
|------------|-------------|
| `list` | 显示计划任务。 |
| `create` / `add` | 根据提示创建定时任务，并可通过重复的 `--skill` 绑定一个或多个技能。 |
| `edit` | 更新任务的时间表、提示、名称、投递方式、重复次数或绑定技能。支持 `--clear-skills`、`--add-skill`、`--remove-skill`。 |
| `pause` | 暂停某个任务而不删除。 |
| `resume` | 恢复已暂停任务，并重新计算下一次触发时间。 |
| `run` | 在下一次 scheduler tick 时触发任务。 |
| `remove` | 删除计划任务。 |
| `status` | 检查 cron scheduler 是否正在运行。 |
| `tick` | 运行一次到期任务后退出。 |

## `hermes webhook`

```bash
hermes webhook <subscribe|list|remove|test>
```

管理用于事件驱动 agent 激活的动态 webhook 订阅。要求配置中启用了 webhook 平台；若未配置，则会打印设置说明。

| 子命令 | 说明 |
|------------|-------------|
| `subscribe` / `add` | 创建一个 webhook 路由，并返回 URL 与 HMAC secret，用于配置你的服务。 |
| `list` / `ls` | 显示所有由 agent 创建的订阅。 |
| `remove` / `rm` | 删除动态订阅。不会影响 `config.yaml` 中的静态路由。 |
| `test` | 发送测试 POST，验证订阅是否工作正常。 |

### `hermes webhook subscribe`

```bash
hermes webhook subscribe <name> [options]
```

| 选项 | 说明 |
|--------|-------------|
| `--prompt` | 提示模板，可引用 `{dot.notation}` 形式的 payload 字段。 |
| `--events` | 接受的事件类型，逗号分隔（如 `issues,pull_request`）。留空表示全部。 |
| `--description` | 面向人的说明文字。 |
| `--skills` | 要为该 agent 运行预加载的技能，逗号分隔。 |
| `--deliver` | 投递目标：`log`（默认）、`telegram`、`discord`、`slack`、`github_comment`。 |
| `--deliver-chat-id` | 跨平台投递的目标 chat / channel ID。 |
| `--secret` | 自定义 HMAC secret。省略时自动生成。 |

订阅会持久化到 `~/.hermes/webhook_subscriptions.json`，并由 webhook adapter 热加载，无需重启 gateway。

## `hermes doctor`

```bash
hermes doctor [--fix]
```

| 选项 | 说明 |
|--------|-------------|
| `--fix` | 尽可能自动修复问题。 |

## `hermes dump`

```bash
hermes dump [--show-keys]
```

输出一份简洁的纯文本 Hermes 安装摘要，适合直接复制到 Discord、GitHub issue 或 Telegram 中寻求帮助。无 ANSI 颜色、无特殊排版，纯数据。

| 选项 | 说明 |
|--------|-------------|
| `--show-keys` | 显示 API Key 的脱敏前后缀（首尾各 4 位），而不是只显示 `set` / `not set`。 |

### 它包含什么

| 部分 | 内容 |
|---------|---------|
| **Header** | Hermes 版本、发布日期、git commit hash |
| **Environment** | 操作系统、Python 版本、OpenAI SDK 版本 |
| **Identity** | 当前 profile 名、`HERMES_HOME` 路径 |
| **Model** | 配置的默认模型与 provider |
| **Terminal** | 后端类型（local、docker、ssh 等） |
| **API keys** | 22 个 provider / 工具 API Key 是否存在 |
| **Features** | 已启用工具集、MCP server 数量、memory provider |
| **Services** | gateway 状态、已配置的消息平台 |
| **Workload** | cron 任务数量、已安装技能数量 |
| **Config overrides** | 与默认值不同的配置项 |

交互式诊断请使用 `hermes doctor`；需要图形化概览时用 `hermes status`。

## `hermes logs`

```bash
hermes logs [log_name] [options]
```

查看、追踪和过滤 Hermes 日志文件。所有日志都位于 `~/.hermes/logs/`（非默认 profile 位于 `<profile>/logs/`）。

日志类型：

| 名称 | 文件 | 内容 |
|------|------|-----------------|
| `agent`（默认） | `agent.log` | 所有 agent 活动：API 调用、工具分发、会话生命周期（INFO 及以上） |
| `errors` | `errors.log` | 仅警告和错误，是 `agent.log` 的过滤子集 |
| `gateway` | `gateway.log` | 消息 gateway 活动：平台连接、消息分发、webhook 事件 |

常用选项：

| 选项 | 说明 |
|--------|-------------|
| `log_name` | 查看哪个日志：`agent`（默认）、`errors`、`gateway`，或 `list` 以列出可用文件及大小。 |
| `-n`, `--lines <N>` | 显示的行数（默认 50）。 |
| `-f`, `--follow` | 实时追踪日志，类似 `tail -f`。按 `Ctrl+C` 停止。 |
| `--level <LEVEL>` | 最低日志级别：`DEBUG`、`INFO`、`WARNING`、`ERROR`、`CRITICAL`。 |
| `--session <ID>` | 过滤包含某个 session ID 子串的日志行。 |
| `--since <TIME>` | 仅显示某个相对时间之后的行，例如 `30m`、`1h`、`2d`。支持 `s`、`m`、`h`、`d`。 |

## `hermes config`

```bash
hermes config <subcommand>
```

| 子命令 | 说明 |
|------------|-------------|
| `show` | 显示当前配置值。 |
| `edit` | 用编辑器打开 `config.yaml`。 |
| `set <key> <value>` | 设置一个配置项。 |
| `path` | 打印配置文件路径。 |
| `env-path` | 打印 `.env` 文件路径。 |
| `check` | 检查缺失或过期配置。 |
| `migrate` | 交互式补全新引入的配置项。 |

## `hermes pairing`

```bash
hermes pairing <list|approve|revoke|clear-pending>
```

| 子命令 | 说明 |
|------------|-------------|
| `list` | 显示待审批和已批准用户。 |
| `approve <platform> <code>` | 批准配对码。 |
| `revoke <platform> <user-id>` | 撤销某个用户的访问权限。 |
| `clear-pending` | 清空待处理配对码。 |

## `hermes skills`

```bash
hermes skills <subcommand>
```

| 子命令 | 说明 |
|------------|-------------|
| `browse` | 分页浏览技能注册表。 |
| `search` | 搜索技能注册表。 |
| `install` | 安装技能。 |
| `inspect` | 安装前预览技能。 |
| `list` | 列出已安装技能。 |
| `check` | 检查已安装 hub 技能是否有上游更新。 |
| `update` | 重新安装有上游更新的 hub 技能。 |
| `audit` | 重新扫描已安装 hub 技能。 |
| `uninstall` | 删除通过 hub 安装的技能。 |
| `publish` | 发布技能到注册表。 |
| `snapshot` | 导出 / 导入技能配置。 |
| `tap` | 管理自定义技能源。 |
| `config` | 按平台交互式启用 / 禁用技能。 |

## `hermes honcho`

```bash
hermes honcho [--target-profile NAME] <subcommand>
```

管理 Honcho 跨会话记忆集成。这个命令由 Honcho memory provider 插件提供，仅在 `memory.provider` 设为 `honcho` 时可用。

## `hermes memory`

```bash
hermes memory <subcommand>
```

配置并管理外部记忆 provider 插件。可用 provider 包括：`honcho`、`openviking`、`mem0`、`hindsight`、`holographic`、`retaindb`、`byterover`、`supermemory`。任一时刻只能启用一个外部 provider；内置记忆（`MEMORY.md` / `USER.md`）始终存在。

## `hermes acp`

```bash
hermes acp
```

将 Hermes 作为 ACP（Agent Client Protocol）stdio 服务器启动，用于编辑器集成。

相关入口：

```bash
hermes-acp
python -m acp_adapter
```

安装支持：

```bash
pip install -e '.[acp]'
```

## `hermes mcp`

```bash
hermes mcp <subcommand>
```

管理 MCP（Model Context Protocol）服务器配置，或将 Hermes 作为 MCP 服务器运行。

## `hermes plugins`

```bash
hermes plugins [subcommand]
```

统一插件管理入口，可同时处理通用插件、memory providers 与 context engines。

## `hermes tools`

```bash
hermes tools [--summary]
```

| 选项 | 说明 |
|--------|-------------|
| `--summary` | 打印当前启用工具摘要后退出。 |

## `hermes sessions`

```bash
hermes sessions <subcommand>
```

用于列出、浏览、导出、删除、裁剪、统计和重命名会话。

## `hermes insights`

```bash
hermes insights [--days N] [--source platform]
```

| 选项 | 说明 |
|--------|-------------|
| `--days <n>` | 分析最近 `n` 天（默认 30）。 |
| `--source <platform>` | 按来源过滤，例如 `cli`、`telegram` 或 `discord`。 |

## `hermes claw`

```bash
hermes claw migrate [options]
```

把你的 OpenClaw 配置迁移到 Hermes。默认从 `~/.openclaw` 读取，写入到 `~/.hermes`。

## `hermes profile`

```bash
hermes profile <subcommand>
```

管理 profiles，即多个隔离的 Hermes 实例。详见 [Profile 命令参考](./profile-commands_zh.md)。

## `hermes completion`

```bash
hermes completion [bash|zsh]
```

向 stdout 输出 shell 自动补全脚本。把它 source 到 shell 配置中后，Hermes 命令、子命令和 profile 名称都能 Tab 补全。

## 维护命令

| 命令 | 说明 |
|---------|-------------|
| `hermes version` | 输出版本信息。 |
| `hermes update` | 拉取最新变更并重装依赖。 |
| `hermes uninstall [--full] [--yes]` | 移除 Hermes；可选同时删除全部配置和数据。 |

## See also

- [斜杠命令参考](./slash-commands_zh.md)
- [CLI 界面](../user-guide/cli_zh.md)
- [Sessions](../user-guide/sessions.md)
- [技能系统](../user-guide/features/skills.md)
- [皮肤与主题](../user-guide/features/skins.md)
