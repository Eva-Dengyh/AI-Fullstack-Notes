---
title: "MCP 配置参考"
description: "Hermes Agent MCP 配置键、过滤语义与实用工具策略参考"
---

# MCP 配置参考

本页是主 MCP 文档的精简参考配套页。

如需理解概念，请参见：
- [MCP（Model Context Protocol）](/docs/user-guide/features/mcp)
- [在 Hermes 中使用 MCP](/docs/guides/use-mcp-with-hermes)

## 根配置结构

```yaml
mcp_servers:
  <server_name>:
    command: "..."      # stdio 服务器
    args: []
    env: {}

    # 或者
    url: "..."          # HTTP 服务器
    headers: {}

    enabled: true
    timeout: 120
    connect_timeout: 60
    tools:
      include: []
      exclude: []
      resources: true
      prompts: true
```

## 服务器级键

| 键 | 类型 | 适用对象 | 含义 |
|---|---|---|---|
| `command` | string | stdio | 要启动的可执行程序 |
| `args` | list | stdio | 子进程参数 |
| `env` | mapping | stdio | 传给子进程的环境变量 |
| `url` | string | HTTP | 远程 MCP 端点 |
| `headers` | mapping | HTTP | 发往远程服务器请求时附带的请求头 |
| `enabled` | bool | 两者 | 为 `false` 时完全跳过该服务器 |
| `timeout` | number | 两者 | 工具调用超时时间 |
| `connect_timeout` | number | 两者 | 初始连接超时时间 |
| `tools` | mapping | 两者 | 过滤与实用工具策略 |
| `auth` | string | HTTP | 认证方式。设为 `oauth` 可启用 OAuth 2.1 + PKCE |
| `sampling` | mapping | 两者 | 服务器主动发起 LLM 请求的策略（见 MCP 指南） |

## `tools` 策略键

| 键 | 类型 | 含义 |
|---|---|---|
| `include` | string 或 list | 白名单：允许注册的服务端原生 MCP 工具 |
| `exclude` | string 或 list | 黑名单：禁止注册的服务端原生 MCP 工具 |
| `resources` | 类布尔值 | 启用/禁用 `list_resources` + `read_resource` |
| `prompts` | 类布尔值 | 启用/禁用 `list_prompts` + `get_prompt` |

## 过滤语义

### `include`

如果设置了 `include`，则只注册这里列出的服务端原生 MCP 工具。

```yaml
tools:
  include: [create_issue, list_issues]
```

### `exclude`

如果设置了 `exclude` 且未设置 `include`，则除这些名称外的所有服务端原生 MCP 工具都会注册。

```yaml
tools:
  exclude: [delete_customer]
```

### 优先级

如果同时设置了二者，以 `include` 为准。

```yaml
tools:
  include: [create_issue]
  exclude: [create_issue, delete_issue]
```

结果：
- `create_issue` 仍然允许
- `delete_issue` 会被忽略，因为 `include` 优先级更高

## 实用工具策略

Hermes 可能会为每个 MCP 服务器注册如下实用包装工具：

资源类：
- `list_resources`
- `read_resource`

提示词类：
- `list_prompts`
- `get_prompt`

### 禁用资源类工具

```yaml
tools:
  resources: false
```

### 禁用提示词类工具

```yaml
tools:
  prompts: false
```

### 基于能力的注册

即使你把 `resources: true` 或 `prompts: true` 打开，Hermes 也只有在 MCP 会话实际暴露出对应能力时，才会注册这些实用工具。

因此以下情况是正常的：
- 你启用了 prompts
- 但没有看到任何 prompt 实用工具
- 因为该服务器本身并不支持 prompts

## `enabled: false`

```yaml
mcp_servers:
  legacy:
    url: "https://mcp.legacy.internal"
    enabled: false
```

行为：
- 不尝试连接
- 不做发现
- 不注册工具
- 配置会保留，以便后续再次启用

## 空结果行为

如果过滤后移除了所有服务端原生工具，且又没有任何实用工具被注册，Hermes 不会为该服务器创建一个空的 MCP 运行时工具集。

## 配置示例

### 安全的 GitHub 白名单

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, update_issue, search_code]
      resources: false
      prompts: false
```

### Stripe 黑名单

```yaml
mcp_servers:
  stripe:
    url: "https://mcp.stripe.com"
    headers:
      Authorization: "Bearer ***"
    tools:
      exclude: [delete_customer, refund_payment]
```

### 仅资源型文档服务器

```yaml
mcp_servers:
  docs:
    url: "https://mcp.docs.example.com"
    tools:
      include: []
      resources: true
      prompts: false
```

## 重新加载配置

修改 MCP 配置后，可用以下命令重新加载服务器：

```text
/reload-mcp
```

## 工具命名

服务端原生 MCP 工具会变成：

```text
mcp_<server>_<tool>
```

示例：
- `mcp_github_create_issue`
- `mcp_filesystem_read_file`
- `mcp_my_api_query_data`

实用工具也遵循同样的前缀规则：
- `mcp_<server>_list_resources`
- `mcp_<server>_read_resource`
- `mcp_<server>_list_prompts`
- `mcp_<server>_get_prompt`

### 名称清洗

服务器名和工具名中的连字符（`-`）与点号（`.`）会在注册前被替换为下划线，以确保工具名能作为 LLM 函数调用 API 的合法标识符。

例如，服务器名为 `my-api`，它暴露了一个名为 `list-items.v2` 的工具，则最终名称会变为：

```text
mcp_my_api_list_items_v2
```

编写 `include` / `exclude` 过滤器时请注意：使用的是 **原始** MCP 工具名（包含连字符和点号），而不是清洗后的版本。

## OAuth 2.1 认证

对于需要 OAuth 的 HTTP 服务器，请在服务器条目上设置 `auth: oauth`：

```yaml
mcp_servers:
  protected_api:
    url: "https://mcp.example.com/mcp"
    auth: oauth
```

行为：
- Hermes 使用 MCP SDK 的 OAuth 2.1 PKCE 流程（元数据发现、动态客户端注册、令牌交换与刷新）
- 首次连接时会弹出浏览器窗口完成授权
- 令牌会持久化到 `~/.hermes/mcp-tokens/<server>.json`，并在后续会话中复用
- 令牌刷新是自动的；只有刷新失败时才需要重新授权
- 仅适用于 HTTP / StreamableHTTP 传输（也就是基于 `url` 的服务器）
