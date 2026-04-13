---
title: 凭证池
description: 为同一提供商汇集多个 API 密钥或 OAuth 令牌以实现自动轮换和速率限制恢复。
sidebar_label: 凭证池
sidebar_position: 9
---

# 凭证池

凭证池让你为同一提供商注册多个 API 密钥或 OAuth 令牌。当一个密钥点击速率限制或账单配额时，Hermes 自动轮换到下一个健康密钥 — 保持你的会话活跃而不用切换提供商。

这与[备用提供商](./fallback-providers.md)不同，后者切换到*不同的*提供商完全。凭证池是同一提供商轮换；备用提供商是跨提供商故障转移。池首先被尝试 — 如果所有池密钥被耗尽，*那时*备用提供商激活。

## 工作原理

```
你的请求
  → 从池中选择密钥（round_robin / least_used / fill_first / random）
  → 发送到提供商
  → 429 速率限制？
      → 重试相同密钥一次（短暂故障）
      → 第二个 429 → 轮换到下一个池密钥
      → 所有密钥耗尽 → fallback_model（不同提供商）
  → 402 账单错误？
      → 立即轮换到下一个池密钥（24h 冷却）
  → 401 身份验证过期？
      → 尝试刷新令牌（OAuth）
      → 刷新失败 → 轮换到下一个池密钥
  → 成功 → 继续正常
```

## 快速开始

如果你已经有一个 API 密钥在 `.env` 中设置，Hermes 自动发现它作为 1 密钥池。要从汇集中受益，添加更多密钥：

```bash
# 添加第二个 OpenRouter 密钥
hermes auth add openrouter --api-key sk-or-v1-your-second-key

# 添加第二个 Anthropic 密钥
hermes auth add anthropic --type api-key --api-key sk-ant-api03-your-second-key

# 添加一个 Anthropic OAuth 凭证（Claude Code 订阅）
hermes auth add anthropic --type oauth
# 打开浏览器用于 OAuth 登录
```

检查你的池：

```bash
hermes auth list
```

输出：
```
openrouter (2 credentials):
  #1  OPENROUTER_API_KEY   api_key env:OPENROUTER_API_KEY ←
  #2  backup-key           api_key manual

anthropic (3 credentials):
  #1  hermes_pkce          oauth   hermes_pkce ←
  #2  claude_code          oauth   claude_code
  #3  ANTHROPIC_API_KEY    api_key env:ANTHROPIC_API_KEY
```

`←` 标记当前选定的凭证。

## 交互式管理

无参数运行 `hermes auth` 用于交互式向导：

```bash
hermes auth
```

这显示你的完整池状态和提供一个菜单：

```
你想做什么？
  1. 添加凭证
  2. 移除凭证
  3. 重置提供商的冷却
  4. 设置提供商的轮换策略
  5. 退出
```

对于支持 API 密钥和 OAuth 的提供商（Anthropic、Nous、Codex），添加流询问哪种类型：

```
anthropic 支持 API 密钥和 OAuth 登录。
  1. API 密钥（粘贴来自提供商仪表板的密钥）
  2. OAuth 登录（通过浏览器身份验证）
类型 [1/2]：
```

## CLI 命令

| 命令 | 描述 |
|---------|-------------|
| `hermes auth` | 交互式池管理向导 |
| `hermes auth list` | 显示所有池和凭证 |
| `hermes auth list <provider>` | 显示特定提供商的池 |
| `hermes auth add <provider>` | 添加凭证（询问类型和密钥） |
| `hermes auth add <provider> --type api-key --api-key <key>` | 非交互式添加 API 密钥 |
| `hermes auth add <provider> --type oauth` | 通过浏览器登录添加 OAuth 凭证 |
| `hermes auth remove <provider> <index>` | 按 1 基索引移除凭证 |
| `hermes auth reset <provider>` | 清除所有冷却/耗尽状态 |

## 轮换策略

通过 `hermes auth` → "设置轮换策略" 或在 `config.yaml` 中配置：

```yaml
credential_pool_strategies:
  openrouter: round_robin
  anthropic: least_used
```

| 策略 | 行为 |
|----------|----------|
| `fill_first`（默认） | 使用第一个健康密钥直到耗尽，然后移到下一个 |
| `round_robin` | 均匀循环所有密钥，每个选择后轮换 |
| `least_used` | 总是选择请求计数最低的密钥 |
| `random` | 在健康密钥中随机选择 |

## 错误恢复

池以不同方式处理不同的错误：

| 错误 | 行为 | 冷却 |
|-------|----------|----------|
| **429 速率限制** | 重试相同密钥一次（短暂）。第二个连续 429 轮换到下一个密钥 | 1 小时 |
| **402 账单/配额** | 立即轮换到下一个密钥 | 24 小时 |
| **401 身份验证过期** | 首先尝试刷新 OAuth 令牌。仅在刷新失败时轮换 | — |
| **所有密钥耗尽** | 如果配置则掉到 `fallback_model` | — |

`has_retried_429` 标志在每个成功的 API 调用时重置，所以单个短暂 429 不触发轮换。

## 自定义端点池

自定义 OpenAI 兼容端点（Together.ai、RunPod、本地服务器）获取他们自己的池，按 `config.yaml` 中 `custom_providers` 的端点名称键入。

当你通过 `hermes model` 设置自定义端点时，它自动生成一个名称如 "Together.ai" 或 "Local (localhost:8080)"。这个名称变成池键。

```bash
# 在通过 hermes model 设置自定义端点后：
hermes auth list
# 显示：
#   Together.ai (1 credential):
#     #1  config key    api_key config:Together.ai ←

# 为同一端点添加第二个密钥：
hermes auth add Together.ai --api-key sk-together-second-key
```

自定义端点池存储在 `auth.json` 下 `credential_pool` 带 `custom:` 前缀：

```json
{
  "credential_pool": {
    "openrouter": [...],
    "custom:together.ai": [...]
  }
}
```

## 自动发现

Hermes 自动从多个源发现凭证并在启动时播种池：

| 源 | 示例 | 自动播种？ |
|--------|---------|-------------|
| 环境变量 | `OPENROUTER_API_KEY`、`ANTHROPIC_API_KEY` | 是 |
| OAuth 令牌（auth.json） | Codex 设备代码、Nous 设备代码 | 是 |
| Claude Code 凭证 | `~/.claude/.credentials.json` | 是（Anthropic） |
| Hermes PKCE OAuth | `~/.hermes/auth.json` | 是（Anthropic） |
| 自定义端点配置 | `config.yaml` 中的 `model.api_key` | 是（自定义端点） |
| 手动项目 | 通过 `hermes auth add` 添加 | 在 auth.json 中持久化 |

自动播种的项目在每个池加载时被更新 — 如果你移除一个 env var，其池项目自动被修剪。手动项目（通过 `hermes auth add` 添加）绝不被自动修剪。

## 委托和子 Agent 共享

当 Agent 通过 `delegate_task` 生成子 Agent 时，父的凭证池自动与孩子共享：

- **相同提供商** — 孩子接收父的完整池，在速率限制时启用密钥轮换
- **不同提供商** — 孩子加载那个提供商的自己的池（如果配置）
- **没有池配置** — 孩子回退到继承的单个 API 密钥

这意味着子 Agent 受益于与父相同的速率限制恢复力，没有额外配置。每任务凭证租赁确保孩子不冲突彼此当并发轮换密钥。

## 线程安全

凭证池为所有状态变更（`select()`、`mark_exhausted_and_rotate()`、`try_refresh_current()`、`mark_used()`）使用线程锁。这确保当网关同时处理多个聊天会话时的安全并发访问。

## 架构

完整数据流图，见仓库中的 [`docs/credential-pool-flow.excalidraw`](https://excalidraw.com/#json=2Ycqhqpi6f12E_3ITyiwh,c7u9jSt5BwrmiVzHGbm87g)。

凭证池在提供商解析层集成：

1. **`agent/credential_pool.py`** — 池管理器：存储、选择、轮换、冷却
2. **`hermes_cli/auth_commands.py`** — CLI 命令和交互式向导
3. **`hermes_cli/runtime_provider.py`** — 池感知凭证解析
4. **`run_agent.py`** — 错误恢复：429/402/401 → 池轮换 → 备用

## 存储

池状态存储在 `~/.hermes/auth.json` 下 `credential_pool` 键：

```json
{
  "version": 1,
  "credential_pool": {
    "openrouter": [
      {
        "id": "abc123",
        "label": "OPENROUTER_API_KEY",
        "auth_type": "api_key",
        "priority": 0,
        "source": "env:OPENROUTER_API_KEY",
        "access_token": "sk-or-v1-...",
        "last_status": "ok",
        "request_count": 142
      }
    ]
  },
}
```

策略存储在 `config.yaml` 中（不是 `auth.json`）：

```yaml
credential_pool_strategies:
  openrouter: round_robin
  anthropic: least_used
```
