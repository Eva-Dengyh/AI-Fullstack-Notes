---
title: "API 服务器"
description: "将 hermes-agent 公开为 OpenAI 兼容的 API，用于任何前端"
---

# API 服务器

API 服务器将 hermes-agent 公开为 OpenAI 兼容的 HTTP 端点。任何使用 OpenAI 格式的前端 — Open WebUI、LobeChat、LibreChat、NextChat、ChatBox 和数百个其他 — 都可以连接到 hermes-agent 并将其用作后端。

Agent 使用其完整工具集（终端、文件操作、网页搜索、内存、技能）处理请求并返回最终响应。流式传输时，工具进度指示器内联出现，以便前端可以看到 Agent 在做什么。

## 快速开始

### 1. 启用 API 服务器

添加到 `~/.hermes/.env`：

```bash
API_SERVER_ENABLED=true
API_SERVER_KEY=change-me-local-dev
# 可选：仅当浏览器必须直接调用 Hermes 时
# API_SERVER_CORS_ORIGINS=http://localhost:3000
```

### 2. 启动网关

```bash
hermes gateway
```

你会看到：

```
[API Server] API server listening on http://127.0.0.1:8642
```

### 3. 连接前端

将任何 OpenAI 兼容客户端指向 `http://localhost:8642/v1`：

```bash
# 用 curl 测试
curl http://localhost:8642/v1/chat/completions \
  -H "Authorization: Bearer change-me-local-dev" \
  -H "Content-Type: application/json" \
  -d '{"model": "hermes-agent", "messages": [{"role": "user", "content": "Hello!"}]}'
```

或连接 Open WebUI、LobeChat 或任何其他前端 — 见 [Open WebUI 集成指南](/docs/user-guide/messaging/open-webui) 了解分步说明。

## 端点

### POST /v1/chat/completions

标准 OpenAI Chat Completions 格式。无状态 — 完整对话通过 `messages` 数组包含在每个请求中。

**请求：**
```json
{
  "model": "hermes-agent",
  "messages": [
    {"role": "system", "content": "你是 Python 专家。"},
    {"role": "user", "content": "写一个斐波那契函数"}
  ],
  "stream": false
}
```

**响应：**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1710000000,
  "model": "hermes-agent",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "这是斐波那契函数..."},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 50, "completion_tokens": 200, "total_tokens": 250}
}
```

**流式传输** (`"stream": true`)：返回服务器发送事件 (SSE) 与令牌逐个响应块。流式传输启用时，令牌在 LLM 生成时实时发出。禁用时，完整响应作为单个 SSE 块发送。

**流式工具进度**：当 Agent 在流式请求期间调用工具时，简短的进度指示器注入到内容流中，因为工具开始执行（例如 `` `💻 pwd` ``、`` `🔍 Python docs` ``）。这些作为内联 markdown 出现在 Agent 的响应文本之前，为 Open WebUI 等前端提供实时工具执行可见性。

### POST /v1/responses

OpenAI Responses API 格式。通过 `previous_response_id` 支持服务器端对话状态 — 服务器存储完整对话历史（包括工具调用和结果），使多轮上下文被保留而无需客户端管理。

**请求：**
```json
{
  "model": "hermes-agent",
  "input": "我的项目中有什么文件？",
  "instructions": "你是一个有帮助的编程助手。",
  "store": true
}
```

**响应：**
```json
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "hermes-agent",
  "output": [
    {"type": "function_call", "name": "terminal", "arguments": "{\"command\": \"ls\"}", "call_id": "call_1"},
    {"type": "function_call_output", "call_id": "call_1", "output": "README.md src/ tests/"},
    {"type": "message", "role": "assistant", "content": [{"type": "output_text", "text": "你的项目有..."}]}
  ],
  "usage": {"input_tokens": 50, "output_tokens": 200, "total_tokens": 250}
}
```

#### 使用 previous_response_id 的多轮

链接响应以维持完整上下文（包括工具调用）跨轮次：

```json
{
  "input": "现在显示我 README",
  "previous_response_id": "resp_abc123"
}
```

服务器从存储的响应链重构完整对话 — 所有先前的工具调用和结果被保留。

#### 命名对话

使用 `conversation` 参数而不是跟踪响应 ID：

```json
{"input": "你好", "conversation": "my-project"}
{"input": "src/ 中有什么？", "conversation": "my-project"}
{"input": "运行测试", "conversation": "my-project"}
```

服务器自动链接到该对话中的最新响应。像网关会话的 `/title` 命令。

### GET /v1/responses/{id}

按 ID 检索先前存储的响应。

### DELETE /v1/responses/{id}

删除存储的响应。

### GET /v1/models

列出 Agent 作为可用模型。公告的模型名称默认为 [profile](/docs/user-guide/features/profiles) 名称（或默认 profile 的 `hermes-agent`）。大多数前端需要用于模型发现。

### GET /health

健康检查。返回 `{"status": "ok"}`。也在 **GET /v1/health** 用于期望 `/v1/` 前缀的 OpenAI 兼容客户端。

## 系统提示处理

当前端发送 `system` 消息（Chat Completions）或 `instructions` 字段（Responses API）时，hermes-agent **在其核心系统提示之上分层**。Agent 保留所有工具、内存和技能 — 前端的系统提示添加额外指令。

这意味着你可以每个前端自定义行为而不失去能力：
- Open WebUI 系统提示："你是 Python 专家。总是包括类型提示。"
- Agent 仍然有终端、文件工具、网页搜索、内存等。

## 身份验证

通过 `Authorization` 头的 Bearer 令牌身份验证：

```
Authorization: Bearer ***
```

通过 `API_SERVER_KEY` 环境变量配置密钥。如果你需要浏览器直接调用 Hermes，也设置 `API_SERVER_CORS_ORIGINS` 为显式允许列表。

:::warning 安全
API 服务器提供对 hermes-agent 工具集的完整访问，**包括终端命令**。当绑定到非回环地址如 `0.0.0.0` 时，`API_SERVER_KEY` 是**必需的**。也保持 `API_SERVER_CORS_ORIGINS` 狭窄以控制浏览器访问。

默认绑定地址 (`127.0.0.1`) 用于仅本地使用。浏览器访问默认禁用；仅为显式受信原点启用。
:::

## 配置

### 环境变量

| 变量 | 默认值 | 描述 |
|----------|---------|-------------|
| `API_SERVER_ENABLED` | `false` | 启用 API 服务器 |
| `API_SERVER_PORT` | `8642` | HTTP 服务器端口 |
| `API_SERVER_HOST` | `127.0.0.1` | 绑定地址（默认仅本地主机） |
| `API_SERVER_KEY` | _(none)_ | Bearer 令牌用于身份验证 |
| `API_SERVER_CORS_ORIGINS` | _(none)_ | 逗号分隔的允许浏览器原点 |
| `API_SERVER_MODEL_NAME` | _(profile name)_ | `/v1/models` 上的模型名称。默认为 profile 名称，或默认 profile 为 `hermes-agent`。 |

### config.yaml

```yaml
# 尚不支持 — 使用环境变量。
# 未来版本将支持 config.yaml。
```

## 安全头

所有响应包括安全头：
- `X-Content-Type-Options: nosniff` — 防止 MIME 类型嗅探
- `Referrer-Policy: no-referrer` — 防止引用者泄漏

## CORS

API 服务器默认**不**启用浏览器 CORS。

对于直接浏览器访问，设置显式允许列表：

```bash
API_SERVER_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

启用 CORS 时：
- **预检响应**包括 `Access-Control-Max-Age: 600`（10 分钟缓存）
- **SSE 流式响应**包括 CORS 头使浏览器 EventSource 客户端工作
- **`Idempotency-Key`** 是允许的请求头 — 客户端可以发送它用于去重（响应按密钥缓存 5 分钟）

大多数文档化的前端如 Open WebUI 以服务器到服务器连接，不需要 CORS。

## 兼容前端

任何支持 OpenAI API 格式的前端都工作。已测试/文档化的集成：

| 前端 | 星数 | 连接 |
|----------|-------|------------|
| [Open WebUI](/docs/user-guide/messaging/open-webui) | 126k | 完整指南可用 |
| LobeChat | 73k | 自定义提供商端点 |
| LibreChat | 34k | librechat.yaml 中的自定义端点 |
| AnythingLLM | 56k | 通用 OpenAI 提供商 |
| NextChat | 87k | BASE_URL 环境变量 |
| ChatBox | 39k | API Host 设置 |
| Jan | 26k | 远程模型配置 |
| HF Chat-UI | 8k | OPENAI_BASE_URL |
| big-AGI | 7k | 自定义端点 |
| OpenAI Python SDK | — | `OpenAI(base_url="http://localhost:8642/v1")` |
| curl | — | 直接 HTTP 请求 |

## 使用 Profiles 的多用户设置

要给多个用户他们自己的隔离 Hermes 实例（单独配置、内存、技能），使用 [profiles](/docs/user-guide/features/profiles)：

```bash
# 创建每个用户的 profile
hermes profile create alice
hermes profile create bob

# 在不同端口上配置每个 profile 的 API 服务器
hermes -p alice config set API_SERVER_ENABLED true
hermes -p alice config set API_SERVER_PORT 8643
hermes -p alice config set API_SERVER_KEY alice-secret

hermes -p bob config set API_SERVER_ENABLED true
hermes -p bob config set API_SERVER_PORT 8644
hermes -p bob config set API_SERVER_KEY bob-secret

# 启动每个 profile 的网关
hermes -p alice gateway &
hermes -p bob gateway &
```

每个 profile 的 API 服务器自动公告 profile 名称作为模型 ID：

- `http://localhost:8643/v1/models` → 模型 `alice`
- `http://localhost:8644/v1/models` → 模型 `bob`

在 Open WebUI 中，添加每个作为单独的连接。模型下拉列表显示 `alice` 和 `bob` 作为不同的模型，每个由完全隔离的 Hermes 实例支持。见 [Open WebUI 指南](/docs/user-guide/messaging/open-webui#multi-user-setup-with-profiles) 了解详情。

## 限制

- **响应存储** — 存储的响应（用于 `previous_response_id`）持久化在 SQLite 并在网关重启中存活。最大 100 个存储的响应（LRU 驱逐）。
- **无文件上传** — 通过上传的文件的视觉/文档分析尚不通过 API 支持。
- **模型字段是装饰性的** — 请求中的 `model` 字段被接受但使用的实际 LLM 模型在 config.yaml 中服务器端配置。
