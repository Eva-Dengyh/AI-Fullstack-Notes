---
title: 备用提供商
description: 配置自动故障转移到备用 LLM 提供商，当主提供商不可用时。
sidebar_label: 备用提供商
---

# 备用提供商

Hermes Agent 有三层恢复能力，在提供商出现问题时保持会话运行：

1. **[凭证池](./credential-pools.md)** — 轮换同一提供商的多个 API 密钥（首先尝试）
2. **主模型备用** — 主模型失败时自动切换到不同的提供商:模型
3. **辅助任务备用** — 视觉、压缩、网页提取等附加任务的独立提供商解析

凭证池处理同一提供商轮换（例如多个 OpenRouter 密钥）。本页面涵盖跨提供商备用。两者都是可选的，独立工作。

## 主模型备用

当主 LLM 提供商遇到错误时 — 速率限制、服务器过载、身份验证失败、连接断开 — Hermes 可以自动在会话中点切换到备用提供商:模型对，不会丢失对话。

### 配置

在 `~/.hermes/config.yaml` 中添加 `fallback_model` 部分：

```yaml
fallback_model:
  provider: openrouter
  model: anthropic/claude-sonnet-4
```

`provider` 和 `model` 都是**必需的**。如果任一缺失，备用被禁用。

### 支持的提供商

| 提供商 | 值 | 要求 |
|----------|-------|-------------|
| AI Gateway | `ai-gateway` | `AI_GATEWAY_API_KEY` |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` |
| Nous Portal | `nous` | `hermes auth` (OAuth) |
| OpenAI Codex | `openai-codex` | `hermes model` (ChatGPT OAuth) |
| GitHub Copilot | `copilot` | `COPILOT_GITHUB_TOKEN`、`GH_TOKEN` 或 `GITHUB_TOKEN` |
| GitHub Copilot ACP | `copilot-acp` | 外部进程（编辑器集成） |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` 或 Claude Code 凭证 |
| z.ai / GLM | `zai` | `GLM_API_KEY` |
| Kimi / Moonshot | `kimi-coding` | `KIMI_API_KEY` |
| MiniMax | `minimax` | `MINIMAX_API_KEY` |
| MiniMax (中国) | `minimax-cn` | `MINIMAX_CN_API_KEY` |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` |
| OpenCode Zen | `opencode-zen` | `OPENCODE_ZEN_API_KEY` |
| OpenCode Go | `opencode-go` | `OPENCODE_GO_API_KEY` |
| Kilo Code | `kilocode` | `KILOCODE_API_KEY` |
| 小米 MiMo | `xiaomi` | `XIAOMI_API_KEY` |
| 阿里巴巴 / DashScope | `alibaba` | `DASHSCOPE_API_KEY` |
| Hugging Face | `huggingface` | `HF_TOKEN` |
| 自定义端点 | `custom` | `base_url` + `api_key_env`（见下文） |

### 自定义端点备用

对于自定义 OpenAI 兼容端点，添加 `base_url` 和可选 `api_key_env`：

```yaml
fallback_model:
  provider: custom
  model: my-local-model
  base_url: http://localhost:8000/v1
  api_key_env: MY_LOCAL_KEY          # 包含 API 密钥的环境变量名
```

### 何时触发备用

当主模型因以下情况失败时备用自动激活：

- **速率限制** (HTTP 429) — 在用尽重试尝试后
- **服务器错误** (HTTP 500、502、503) — 在用尽重试尝试后
- **身份验证失败** (HTTP 401、403) — 立即（无重试价值）
- **未找到** (HTTP 404) — 立即
- **无效响应** — 当 API 返回格式不正确或空响应时重复

触发时，Hermes：

1. 解析备用提供商的凭证
2. 构建新的 API 客户端
3. 在原地交换模型、提供商和客户端
4. 重置重试计数器并继续对话

切换是无缝的 — 对话历史、工具调用和上下文被保留。Agent 从完全相同的位置继续，只是使用不同的模型。

:::info 一次性
备用最多激活**一次**每个会话。如果备用提供商也失败，正常错误处理接管（重试，然后错误消息）。这防止级联备用循环。
:::

### 示例

**作为 Anthropic native 的备用的 OpenRouter：**
```yaml
model:
  provider: anthropic
  default: claude-sonnet-4-6

fallback_model:
  provider: openrouter
  model: anthropic/claude-sonnet-4
```

**作为 OpenRouter 的备用的 Nous Portal：**
```yaml
model:
  provider: openrouter
  default: anthropic/claude-opus-4

fallback_model:
  provider: nous
  model: nous-hermes-3
```

**作为云的备用的本地模型：**
```yaml
fallback_model:
  provider: custom
  model: llama-3.1-70b
  base_url: http://localhost:8000/v1
  api_key_env: LOCAL_API_KEY
```

**Codex OAuth 作为备用：**
```yaml
fallback_model:
  provider: openai-codex
  model: gpt-5.3-codex
```

### 备用适用的地方

| 上下文 | 支持备用 |
|---------|-------------------|
| CLI 会话 | ✔ |
| 消息传递网关（Telegram、Discord 等） | ✔ |
| 子 Agent 委托 | ✘ (子 Agent 不继承备用配置) |
| Cron 作业 | ✘ (使用固定提供商运行) |
| 辅助任务（视觉、压缩） | ✘ (使用自己的提供商链 — 见下文) |

:::tip
没有针对 `fallback_model` 的环境变量 — 它完全通过 `config.yaml` 配置。这是有意的：备用配置是有意选择，不是过时的 shell 导出应该覆盖的。
:::

---

## 辅助任务备用

Hermes 为附加任务使用单独的轻量级模型。每个任务都有自己的提供商解析链，充当内置备用系统。

### 具有独立提供商解析的任务

| 任务 | 作用 | 配置密钥 |
|------|-------------|-----------|
| 视觉 | 图像分析、浏览器截图 | `auxiliary.vision` |
| 网页提取 | 网页摘要 | `auxiliary.web_extract` |
| 压缩 | 上下文压缩摘要 | `auxiliary.compression` 或 `compression.summary_provider` |
| 会话搜索 | 过去会话摘要 | `auxiliary.session_search` |
| Skills Hub | 技能搜索和发现 | `auxiliary.skills_hub` |
| MCP | MCP 辅助操作 | `auxiliary.mcp` |
| 内存刷新 | 内存巩固 | `auxiliary.flush_memories` |

### 自动检测链

当任务的提供商设置为 `"auto"`（默认值）时，Hermes 尝试提供商直到一个工作：

**对于文本任务（压缩、网页提取等）：**

```text
OpenRouter → Nous Portal → 自定义端点 → Codex OAuth →
API 密钥提供商（z.ai、Kimi、MiniMax、小米 MiMo、Hugging Face、Anthropic） → 放弃
```

**对于视觉任务：**

```text
主提供商（如果支持视觉） → OpenRouter → Nous Portal →
Codex OAuth → Anthropic → 自定义端点 → 放弃
```

如果解析的提供商在调用时失败，Hermes 也有内部重试：如果提供商不是 OpenRouter 且没有设置显式 `base_url`，它尝试 OpenRouter 作为最后手段的备用。

### 配置辅助提供商

每个任务可以在 `config.yaml` 中独立配置：

```yaml
auxiliary:
  vision:
    provider: "auto"              # auto | openrouter | nous | codex | main | anthropic
    model: ""                     # 例如 "openai/gpt-4o"
    base_url: ""                  # 直接端点（优先于提供商）
    api_key: ""                   # base_url 的 API 密钥

  web_extract:
    provider: "auto"
    model: ""

  compression:
    provider: "auto"
    model: ""

  session_search:
    provider: "auto"
    model: ""

  skills_hub:
    provider: "auto"
    model: ""

  mcp:
    provider: "auto"
    model: ""

  flush_memories:
    provider: "auto"
    model: ""
```

上述每个任务都遵循相同的 **provider / model / base_url** 模式。上下文压缩使用自己的顶级块：

```yaml
compression:
  summary_provider: main                             # 与辅助任务相同的提供商选项
  summary_model: google/gemini-3-flash-preview
  summary_base_url: null                             # 自定义 OpenAI 兼容端点
```

备用模型使用：

```yaml
fallback_model:
  provider: openrouter
  model: anthropic/claude-sonnet-4
  # base_url: http://localhost:8000/v1               # 可选自定义端点
```

三者 — 辅助、压缩、备用 — 以相同方式工作：设置 `provider` 以选择处理请求者，`model` 以选择哪个模型，以及 `base_url` 以指向自定义端点（覆盖提供商）。

### 辅助任务的提供商选项

这些选项仅适用于 `auxiliary:`、`compression:` 和 `fallback_model:` 配置 — `"main"` 不是顶级 `model.provider` 的有效值。对于自定义端点，在 `model:` 部分中使用 `provider: custom`（见 [AI Providers](/docs/integrations/providers)）。

| 提供商 | 描述 | 要求 |
|----------|-------------|-------------|
| `"auto"` | 尝试提供商直到一个工作（默认） | 至少配置一个提供商 |
| `"openrouter"` | 强制 OpenRouter | `OPENROUTER_API_KEY` |
| `"nous"` | 强制 Nous Portal | `hermes auth` |
| `"codex"` | 强制 Codex OAuth | `hermes model` → Codex |
| `"main"` | 使用主 Agent 使用的任何提供商（仅辅助任务） | 配置的活跃主提供商 |
| `"anthropic"` | 强制 Anthropic native | `ANTHROPIC_API_KEY` 或 Claude Code 凭证 |

### 直接端点覆盖

对于任何辅助任务，设置 `base_url` 绕过提供商解析并直接向该端点发送请求：

```yaml
auxiliary:
  vision:
    base_url: "http://localhost:1234/v1"
    api_key: "local-key"
    model: "qwen2.5-vl"
```

`base_url` 优先于 `provider`。Hermes 使用配置的 `api_key` 进行身份验证，如果未设置则回退到 `OPENAI_API_KEY`。它**不**为自定义端点重用 `OPENROUTER_API_KEY`。

---

## 上下文压缩备用

上下文压缩有一个传统配置路径，除了辅助系统外：

```yaml
compression:
  summary_provider: "auto"                    # auto | openrouter | nous | main
  summary_model: "google/gemini-3-flash-preview"
```

这等价于配置 `auxiliary.compression.provider` 和 `auxiliary.compression.model`。如果两者都设置，`auxiliary.compression` 值优先。

如果没有提供商可用于压缩，Hermes 删除中间对话轮次而不生成摘要，而不是让会话失败。

---

## 委托提供商覆盖

由 `delegate_task` 生成的子 Agent 不使用主备用模型。但是，它们可以路由到不同的提供商:模型对以优化成本：

```yaml
delegation:
  provider: "openrouter"                      # 覆盖所有子 Agent 的提供商
  model: "google/gemini-3-flash-preview"      # 覆盖模型
  # base_url: "http://localhost:1234/v1"      # 或使用直接端点
  # api_key: "local-key"
```

见 [子 Agent 委托](/docs/user-guide/features/delegation) 了解完整配置详情。

---

## Cron 作业提供商

Cron 作业与在执行时配置的任何提供商一起运行。它们不支持备用模型。要为 cron 作业使用不同的提供商，在 cron 作业本身上配置 `provider` 和 `model` 覆盖：

```python
cronjob(
    action="create",
    schedule="every 2h",
    prompt="检查服务器状态",
    provider="openrouter",
    model="google/gemini-3-flash-preview"
)
```

见 [计划任务（Cron）](/docs/user-guide/features/cron) 了解完整配置详情。

---

## 总结

| 功能 | 备用机制 | 配置位置 |
|---------|-------------------|----------------|
| 主 Agent 模型 | config.yaml 中的 `fallback_model` — 错误时一次性故障转移 | `fallback_model:`（顶级） |
| 视觉 | 自动检测链 + 内部 OpenRouter 重试 | `auxiliary.vision` |
| 网页提取 | 自动检测链 + 内部 OpenRouter 重试 | `auxiliary.web_extract` |
| 上下文压缩 | 自动检测链，如不可用则降级为无摘要 | `auxiliary.compression` 或 `compression.summary_provider` |
| 会话搜索 | 自动检测链 | `auxiliary.session_search` |
| Skills Hub | 自动检测链 | `auxiliary.skills_hub` |
| MCP 辅助 | 自动检测链 | `auxiliary.mcp` |
| 内存刷新 | 自动检测链 | `auxiliary.flush_memories` |
| 委托 | 仅提供商覆盖（无自动备用） | `delegation.provider` / `delegation.model` |
| Cron 作业 | 仅每个作业提供商覆盖（无自动备用） | 每个作业 `provider` / `model` |
