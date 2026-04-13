---
sidebar_position: 4
title: "MCP（模型上下文协议）"
description: "连接 Hermes Agent 到外部工具服务器的 MCP — 并精确控制 Hermes 加载哪些 MCP 工具"
---

# MCP（模型上下文协议）

MCP 让 Hermes Agent 连接到外部工具服务器，以便 Agent 可使用位于 Hermes 之外的工具 — GitHub、数据库、文件系统、浏览器堆栈、内部 API 等。

如果你曾想 Hermes 使用已存在某处的工具，MCP 通常是最干净的方式。

## MCP 给你的

- 无需先编写原生 Hermes 工具即可访问外部工具生态系统
- 本地 stdio 服务器和远程 HTTP MCP 服务器在相同配置中
- 启动时自动工具发现和注册
- 当服务器支持时 MCP 资源和提示的实用包装器
- 按服务器过滤，以便你仅暴露 Hermes 实际想要的 MCP 工具

## 快速开始

1. 如果你使用了标准安装脚本，MCP 支持已包括。否则，安装它：

```bash
cd ~/.hermes/hermes-agent
uv pip install -e ".[mcp]"
```

2. 添加 MCP 服务器到 `~/.hermes/config.yaml`：

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/projects"]
```

3. 启动 Hermes：

```bash
hermes chat
```

4. 要求 Hermes 使用 MCP 支持的功能。

例如：

```text
列出 /home/user/projects 中的文件并总结仓库结构。
```

Hermes 会发现 MCP 服务器的工具并像使用任何其他工具一样使用它们。

## 两种 MCP 服务器

### Stdio 服务器

Stdio 服务器作为本地子进程运行并通过 stdin/stdout 通信。

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
```

何时使用 stdio 服务器：
- 服务器安装在本地
- 你想要对本地资源的低延迟访问
- 你遵循显示 `command`、`args` 和 `env` 的 MCP 服务器文档

### HTTP 服务器

HTTP MCP 服务器是 Hermes 直接连接的远程端点。

```yaml
mcp_servers:
  remote_api:
    url: "https://mcp.example.com/mcp"
    headers:
      Authorization: "Bearer ***"
```

何时使用 HTTP 服务器：
- MCP 服务器托管在别处
- 你的组织暴露内部 MCP 端点
- 你不想 Hermes 为该集成生成本地子进程

## 基本配置参考

Hermes 从 `~/.hermes/config.yaml` 中 `mcp_servers` 下读取 MCP 配置。

### 常见键

| 键 | 类型 | 含义 |
|---|---|---|
| `command` | string | Stdio MCP 服务器的可执行文件 |
| `args` | list | Stdio 服务器的参数 |
| `env` | mapping | 传递给 stdio 服务器的环境变量 |
| `url` | string | HTTP MCP 端点 |
| `headers` | mapping | 远程服务器的 HTTP 标题 |
| `timeout` | number | 工具调用超时 |
| `connect_timeout` | number | 初始连接超时 |
| `enabled` | bool | 如果 `false`，Hermes 完全跳过服务器 |
| `tools` | mapping | 按服务器工具过滤和实用政策 |

### 最小 stdio 示例

```yaml
mcp_servers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
```

### 最小 HTTP 示例

```yaml
mcp_servers:
  company_api:
    url: "https://mcp.internal.example.com"
    headers:
      Authorization: "Bearer ***"
```

## Hermes 如何注册 MCP 工具

Hermes 为 MCP 工具加前缀，使它们不会与内置名称碰撞：

```text
mcp_<server_name>_<tool_name>
```

示例：

| 服务器 | MCP 工具 | 注册名称 |
|---|---|---|
| `filesystem` | `read_file` | `mcp_filesystem_read_file` |
| `github` | `create-issue` | `mcp_github_create_issue` |
| `my-api` | `query.data` | `mcp_my_api_query_data` |

实际上，你通常无需手动调用加前缀名称 — Hermes 看到工具并在正常推理期间选择它。

## MCP 实用工具

当受支持时，Hermes 也注册 MCP 资源和提示的实用工具：

- `list_resources`
- `read_resource`
- `list_prompts`
- `get_prompt`

这些用相同前缀模式按服务器注册，例如：

- `mcp_github_list_resources`
- `mcp_github_get_prompt`

### 重要

这些实用工具现在能力感知：
- Hermes 仅在 MCP 会话实际支持资源操作时注册资源实用工具
- Hermes 仅在 MCP 会话实际支持提示操作时注册提示实用工具

所以仅暴露可调用工具但无资源/提示的服务器不会获得那些额外包装器。

## 按服务器过滤

你可控制每个 MCP 服务器向 Hermes 贡献哪些工具，允许对工具命名空间的精细管理。

### 完全禁用服务器

```yaml
mcp_servers:
  legacy:
    url: "https://mcp.legacy.internal"
    enabled: false
```

如果 `enabled: false`，Hermes 完全跳过服务器甚至不尝试连接。

### 白名单服务器工具

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [create_issue, list_issues]
```

仅那些 MCP 服务器工具被注册。

### 黑名单服务器工具

```yaml
mcp_servers:
  stripe:
    url: "https://mcp.stripe.com"
    tools:
      exclude: [delete_customer]
```

所有服务器工具被注册除了被排除的。

### 优先级规则

如果两者都存在：

```yaml
tools:
  include: [create_issue]
  exclude: [create_issue, delete_issue]
```

`include` 获胜。

### 也过滤实用工具

你也可单独禁用 Hermes 添加的实用包装器：

```yaml
mcp_servers:
  docs:
    url: "https://mcp.docs.example.com"
    tools:
      prompts: false
      resources: false
```

那意味着：
- `tools.resources: false` 禁用 `list_resources` 和 `read_resource`
- `tools.prompts: false` 禁用 `list_prompts` 和 `get_prompt`

### 完整示例

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [create_issue, list_issues, search_code]
      prompts: false

  stripe:
    url: "https://mcp.stripe.com"
    headers:
      Authorization: "Bearer ***"
    tools:
      exclude: [delete_customer]
      resources: false

  legacy:
    url: "https://mcp.legacy.internal"
    enabled: false
```

## 如果所有内容被过滤出来会怎样

如果你的配置过滤出所有可调用工具并禁用或忽略所有支持的实用工具，Hermes 不为该服务器创建空运行时 MCP 工具集。

那保持工具列表干净。

## 运行时行为

### 发现时间

Hermes 在启动时发现 MCP 服务器并将它们的工具注册到正常工具注册表中。

### 动态工具发现

MCP 服务器可通过发送 `notifications/tools/list_changed` 通知在运行时通知 Hermes 当它们的可用工具改变。当 Hermes 收到此通知时，它自动重新获取服务器的工具列表并更新注册表 — 无需手动 `/reload-mcp`。

这对 MCP 服务器很有用，其能力在运行时动态改变（例如，加载新数据库 schema 时添加工具的服务器，或服务离线时删除工具的服务器）。

刷新受锁保护，以便来自同一服务器的快速连发通知不会导致重叠刷新。提示和资源改变通知（`prompts/list_changed`、`resources/list_changed`）被接收但还未被作用。

### 重新加载

如果你改变 MCP 配置，使用：

```text
/reload-mcp
```

这从配置重新加载 MCP 服务器并刷新可用工具列表。对于由服务器本身推动的运行时工具改变，参见上面的 [Dynamic Tool Discovery](#dynamic-tool-discovery)。

### 工具集

每个配置的 MCP 服务器在它贡献至少一个注册工具时也创建运行时工具集：

```text
mcp-<server>
```

那使 MCP 服务器在工具集级别更容易推理。

## 安全模型

### Stdio 环境过滤

对于 stdio 服务器，Hermes 不盲目传递你的完整 shell 环境。

仅显式配置的 `env` 加安全基线被传递。这减少意外秘密泄露。

### 配置级暴露控制

新的过滤支持也是安全控制：
- 禁用你不想模型看到的危险工具
- 为敏感服务器暴露仅最小白名单
- 当你不想那个表面暴露时禁用资源/提示包装器

## 示例用途

### 带最小 issue 管理表面的 GitHub 服务器

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, update_issue]
      prompts: false
      resources: false
```

使用它像：

```text
显示标记为 bug 的开放 issue，然后为不稳定 MCP 重新连接行为起草新 issue。
```

### 删除危险操作的 Stripe 服务器

```yaml
mcp_servers:
  stripe:
    url: "https://mcp.stripe.com"
    headers:
      Authorization: "Bearer ***"
    tools:
      exclude: [delete_customer, refund_payment]
```

使用它像：

```text
查找最后 10 次失败的支付并总结常见失败原因。
```

### 单项目根的文件系统服务器

```yaml
mcp_servers:
  project_fs:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/my-project"]
```

使用它像：

```text
检查项目根并解释目录布局。
```

## 故障排除

### MCP 服务器不连接

检查：

```bash
# 验证 MCP 依赖已安装（已包括在标准安装中）
cd ~/.hermes/hermes-agent && uv pip install -e ".[mcp]"

node --version
npx --version
```

然后验证你的配置并重启 Hermes。

### 工具不出现

可能的原因：
- 服务器未能连接
- 发现失败
- 你的过滤配置排除了工具
- 实用能力在该服务器上不存在
- 服务器被禁用（`enabled: false`）

如果你故意过滤，这是预期的。

### 为什么资源或提示实用工具没有出现？

因为 Hermes 现在仅在以下两者都真时注册这些包装器：
1. 你的配置允许它们
2. 服务器会话实际支持该能力

这是有意的且保持工具列表诚实。

## MCP 采样支持

MCP 服务器可通过 `sampling/createMessage` 协议从 Hermes 请求 LLM 推理。这允许 MCP 服务器要求 Hermes 为其生成文本 — 对需要 LLM 能力但没有自己模型访问的服务器很有用。

采样**默认为所有 MCP 服务器启用**（当 MCP SDK 支持时）。按服务器在 `sampling` 键下配置它：

```yaml
mcp_servers:
  my_server:
    command: "my-mcp-server"
    sampling:
      enabled: true            # 启用采样（默认：true）
      model: "openai/gpt-4o"  # 为采样请求覆盖模型（可选）
      max_tokens_cap: 4096     # 每采样响应最大令牌（默认：4096）
      timeout: 30              # 每请求超时（秒，默认：30）
      max_rpm: 10              # 速率限制：每分钟最大请求（默认：10）
      max_tool_rounds: 5       # 采样循环中的最大工具轮（默认：5）
      allowed_models: []       # 服务器可请求的模型名称允许列表（空 = 任何）
      log_level: "info"        # 审计日志级别：debug、info 或 warning（默认：info）
```

采样处理程序包括滑动窗口速率限制器、按请求超时和工具循环深度限制以防止失控使用。指标（请求计数、错误、用过的令牌）按服务器实例跟踪。

为特定服务器禁用采样：

```yaml
mcp_servers:
  untrusted_server:
    url: "https://mcp.example.com"
    sampling:
      enabled: false
```

## 将 Hermes 作为 MCP 服务器运行

除了连接**到** MCP 服务器，Hermes 也可**成为** MCP 服务器。这让其他 MCP 能力的 Agent（Claude Code、Cursor、Codex 或任何 MCP 客户端）使用 Hermes 的消息能力 — 列表对话、读消息历史和跨所有连接平台发送消息。

### 何时使用这个

- 你想让 Claude Code、Cursor 或另一个编码 Agent 通过 Hermes 发送和读 Telegram/Discord/Slack 消息
- 你想要单一 MCP 服务器一次桥接到所有 Hermes 连接消息平台
- 你已有运行的 Hermes 网关及连接平台

### 快速开始

```bash
hermes mcp serve
```

这启动一个 stdio MCP 服务器。MCP 客户端（非你）管理进程生命周期。

### MCP 客户端配置

将 Hermes 添加到你的 MCP 客户端配置。例如，在 Claude Code 的 `~/.claude/claude_desktop_config.json` 中：

```json
{
  "mcpServers": {
    "hermes": {
      "command": "hermes",
      "args": ["mcp", "serve"]
    }
  }
}
```

或如果你在特定位置安装了 Hermes：

```json
{
  "mcpServers": {
    "hermes": {
      "command": "/home/user/.hermes/hermes-agent/venv/bin/hermes",
      "args": ["mcp", "serve"]
    }
  }
}
```

### 可用工具

MCP 服务器暴露 10 个工具，匹配 OpenClaw 的频道桥表面加 Hermes 特定频道浏览器：

| 工具 | 描述 |
|------|-------------|
| `conversations_list` | 列表活跃消息传递对话。按平台过滤或按名称搜索。 |
| `conversation_get` | 获得关于一个对话的详细信息（通过会话键）。 |
| `messages_read` | 读对话的最近消息历史。 |
| `attachments_fetch` | 从特定消息提取非文本附件（图像、媒体）。 |
| `events_poll` | 轮询新对话事件（从光标位置起）。 |
| `events_wait` | 长轮询 / 阻塞直到下一事件到达（接近实时）。 |
| `messages_send` | 通过平台发送消息（例如 `telegram:123456`、`discord:#general`）。 |
| `channels_list` | 列表所有平台跨可用消息目标。 |
| `permissions_list_open` | 列表此桥会话期间观察到的待决批准请求。 |
| `permissions_respond` | 允许或拒绝待决批准请求。 |

### 事件系统

MCP 服务器包括一个对 Hermes 会话数据库的实时事件桥进行轮询以获得新消息。这给 MCP 客户端接近实时的对话感知：

```
# 轮询新事件（非阻塞）
events_poll(after_cursor=0)

# 等待下一事件（阻塞至超时）
events_wait(after_cursor=42, timeout_ms=30000)
```

事件类型：`message`、`approval_requested`、`approval_resolved`

事件队列是内存中的并在桥连接时启动。较旧消息可通过 `messages_read` 使用。

### 选项

```bash
hermes mcp serve              # 正常模式
hermes mcp serve --verbose    # stderr 上的调试日志
```

### 工作原理

MCP 服务器直接从 Hermes 会话存储读取对话数据（`~/.hermes/sessions/sessions.json` 和 SQLite 数据库）。后台线程轮询数据库以查找新消息并维护内存中事件队列。对于发送消息，它使用与 Hermes Agent 本身相同的 `send_message` 基础设施。

网关**不需要**为读操作运行（列表对话、读历史、轮询事件）。它**确实需要**为发送操作运行，因为平台适配器需要活跃连接。

### 当前限制

- 仅 Stdio 传输（还没有 HTTP MCP 传输）
- 事件轮询在 ~200ms 间隔，通过 mtime 优化 DB 轮询（文件未改变时跳过工作）
- 还没有 `claude/channel` 推通知协议
- 仅文本发送（无通过 `messages_send` 的媒体/附件发送）

## 相关文档

- [Use MCP with Hermes](/docs/guides/use-mcp-with-hermes)
- [CLI Commands](/docs/reference/cli-commands)
- [Slash Commands](/docs/reference/slash-commands)
- [FAQ](/docs/reference/faq)
