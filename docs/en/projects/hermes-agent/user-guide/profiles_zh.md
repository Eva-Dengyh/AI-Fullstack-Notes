---
---

# Profiles：运行多个 Agent

在同一台机器上运行多个独立的 Hermes agent——每个都有自己独立的配置、API 密钥、内存、会话、技能和网关。

## 什么是 Profile？

Profile 是一个完全隔离的 Hermes 环境。每个 profile 都有自己的目录，包含自己独立的 `config.yaml`、`.env`、`SOUL.md`、记忆、会话、技能、计划任务和状态数据库。Profile 让您可以为不同目的运行独立的 agent——编程助手、个人机器人、研究 agent——而不会相互污染。

当您创建一个 profile 时，它会自动成为自己的命令。创建一个名为 `coder` 的 profile，您立即拥有 `coder chat`、`coder setup`、`coder gateway start` 等命令。

## 快速开始

```bash
hermes profile create coder       # 创建 profile + "coder" 命令别名
coder setup                       # 配置 API 密钥和模型
coder chat                        # 开始聊天
```

就这样。`coder` 现在是一个完全独立的 agent。它有自己的配置、自己的内存、自己的一切。

## 创建 Profile

### 空白 Profile

```bash
hermes profile create mybot
```

创建一个包含捆绑技能的新 profile。运行 `mybot setup` 配置 API 密钥、模型和网关令牌。

### 仅克隆配置（`--clone`）

```bash
hermes profile create work --clone
```

将当前 profile 的 `config.yaml`、`.env` 和 `SOUL.md` 复制到新 profile。相同的 API 密钥和模型，但全新的会话和内存。编辑 `~/.hermes/profiles/work/.env` 使用不同的 API 密钥，或编辑 `~/.hermes/profiles/work/SOUL.md` 使用不同的人格。

### 克隆一切（`--clone-all`）

```bash
hermes profile create backup --clone-all
```

复制**所有内容**——配置、API 密钥、人格、所有记忆、完整会话历史、技能、计划任务、插件。完整的快照。可用于备份或分叉已有上下文的 agent。

### 从特定 Profile 克隆

```bash
hermes profile create work --clone --clone-from coder
```

:::tip Honcho 内存 + Profiles
启用 Honcho 时，`--clone` 会自动为新 profile 创建专用 AI 对等体，同时共享相同的用户工作区。每个 profile 建立自己的观察和身份。详见 [Honcho——多 Agent / Profiles](./features/memory-providers.md#honcho)。
:::

## 使用 Profiles

### 命令别名

每个 profile 自动在 `~/.local/bin/<name>` 获取命令别名：

```bash
coder chat                    # 与 coder agent 聊天
coder setup                   # 配置 coder 的设置
coder gateway start           # 启动 coder 的网关
coder doctor                  # 检查 coder 的健康状态
coder skills list             # 列出 coder 的技能
coder config set model.model anthropic/claude-sonnet-4
```

别名适用于每个 hermes 子命令——它只是底层 `hermes -p <name>` 的包装。

### `-p` 标志

您也可以用任何命令显式指定 profile：

```bash
hermes -p coder chat
hermes --profile=coder doctor
hermes chat -p coder -q "你好"    # 可在任何位置使用
```

### 粘性默认（`hermes profile use`）

```bash
hermes profile use coder
hermes chat                   # 现在指向 coder
hermes tools                  # 配置 coder 的工具
hermes profile use default    # 切换回来
```

设置一个默认项，使普通 `hermes` 命令指向该 profile。就像 `kubectl config use-context`。

### 了解当前所在位置

CLI 始终显示哪个 profile 处于活动状态：

- **提示符**：`coder ❯` 而不是 `❯`
- **横幅**：启动时显示 `Profile: coder`
- **`hermes profile`**：显示当前 profile 名称、路径、模型、网关状态

## 运行网关

每个 profile 作为独立进程运行自己的网关，使用自己的 bot 令牌：

```bash
coder gateway start           # 启动 coder 的网关
assistant gateway start       # 启动 assistant 的网关（独立进程）
```

### 不同的 Bot 令牌

每个 profile 有自己的 `.env` 文件。在每个中配置不同的 Telegram/Discord/Slack bot 令牌：

```bash
# 编辑 coder 的令牌
nano ~/.hermes/profiles/coder/.env

# 编辑 assistant 的令牌
nano ~/.hermes/profiles/assistant/.env
```

### 安全：令牌锁

如果两个 profile 意外使用相同的 bot 令牌，第二个网关将被阻止，并显示明确命名冲突 profile 的错误。支持 Telegram、Discord、Slack、WhatsApp 和 Signal。

### 持久服务

```bash
coder gateway install         # 创建 hermes-gateway-coder systemd/launchd 服务
assistant gateway install     # 创建 hermes-gateway-assistant 服务
```

每个 profile 获取自己的服务名称。它们独立运行。

## 配置 Profile

每个 profile 有自己的：

- **`config.yaml`** — 模型、provider、工具集、所有设置
- **`.env`** — API 密钥、bot 令牌
- **`SOUL.md`** — 人格和指令

```bash
coder config set model.model anthropic/claude-sonnet-4
echo "你是一个专注的编程助手。" > ~/.hermes/profiles/coder/SOUL.md
```

## 更新

`hermes update` 一次性拉取代码（共享）并将新的捆绑技能同步到**所有** profile：

```bash
hermes update
# → 代码已更新（12 次提交）
# → 技能已同步：default（已是最新），coder（+2 新），assistant（+2 新）
```

用户修改的技能永远不会被覆盖。

## 管理 Profile

```bash
hermes profile list           # 显示所有 profile 及状态
hermes profile show coder     # 显示一个 profile 的详细信息
hermes profile rename coder dev-bot   # 重命名（更新别名 + 服务）
hermes profile export coder   # 导出到 coder.tar.gz
hermes profile import coder.tar.gz   # 从存档导入
```

## 删除 Profile

```bash
hermes profile delete coder
```

这会停止网关、移除 systemd/launchd 服务、移除命令别名，并删除所有 profile 数据。系统会要求您输入 profile 名称以确认。

使用 `--yes` 跳过确认：`hermes profile delete coder --yes`

:::note
您无法删除默认 profile（`~/.hermes`）。要删除所有内容，请使用 `hermes uninstall`。
:::

## Tab 补全

```bash
# Bash
eval "$(hermes completion bash)"

# Zsh
eval "$(hermes completion zsh)"
```

将行添加到您的 `~/.bashrc` 或 `~/.zshrc` 以实现持久补全。补全在 `-p` 之后显示 profile 名称、profile 子命令和顶级命令。

## 工作原理

Profiles 使用 `HERMES_HOME` 环境变量。当您运行 `coder chat` 时，包装脚本在启动 hermes 之前设置 `HERMES_HOME=~/.hermes/profiles/coder`。由于代码库中 100+ 个文件通过 `get_hermes_home()` 解析路径，一切自动绑定到 profile 的目录——配置、会话、内存、技能、状态数据库、网关 PID、日志和计划任务。

默认 profile 就是 `~/.hermes` 本身。无需迁移——现有安装行为相同。
