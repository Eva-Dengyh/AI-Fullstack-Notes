---
title: 提供商路由
description: 配置 OpenRouter 提供商偏好以优化成本、速度或质量。
sidebar_label: 提供商路由
---

# 提供商路由

当使用 [OpenRouter](https://openrouter.ai) 作为你的 LLM 提供商时，Hermes Agent 支持**提供商路由** — 对哪些底层 AI 提供商处理你的请求的精细控制及其如何优先级。

OpenRouter 路由请求到许多提供商（例如 Anthropic、Google、AWS Bedrock、Together AI）。提供商路由让你针对成本、速度、质量进行优化，或执行特定提供商要求。

## 配置

在你的 `~/.hermes/config.yaml` 中添加 `provider_routing` 部分：

```yaml
provider_routing:
  sort: "price"           # 如何对提供商进行排名
  only: []                # 白名单：仅使用这些提供商
  ignore: []              # 黑名单：永远不使用这些提供商
  order: []               # 显式提供商优先级顺序
  require_parameters: false  # 仅使用支持所有参数的提供商
  data_collection: null   # 控制数据收集（"allow" 或 "deny"）
```

:::info
提供商路由仅在使用 OpenRouter 时适用。它对直接提供商连接（例如直接连接到 Anthropic API）无影响。
:::

## 选项

### `sort`

控制 OpenRouter 为你的请求如何对可用提供商进行排名。

| 值 | 描述 |
|-------|-------------|
| `"price"` | 最便宜提供商优先 |
| `"throughput"` | 最快令牌数/秒优先 |
| `"latency"` | 最低首令牌时间优先 |

```yaml
provider_routing:
  sort: "price"
```

### `only`

提供商名称的白名单。设置时，**仅**这些提供商会被使用。所有其他被排除。

```yaml
provider_routing:
  only:
    - "Anthropic"
    - "Google"
```

### `ignore`

提供商名称的黑名单。这些提供商**永不**被使用，即使它们提供最便宜或最快的选项。

```yaml
provider_routing:
  ignore:
    - "Together"
    - "DeepInfra"
```

### `order`

显式优先级顺序。列出的第一个提供商是首选。未列出的提供商作为回退被使用。

```yaml
provider_routing:
  order:
    - "Anthropic"
    - "Google"
    - "AWS Bedrock"
```

### `require_parameters`

当 `true` 时，OpenRouter 仅路由到支持请求中**所有**参数（如 `temperature`、`top_p`、`tools` 等）的提供商。这避免了无声参数丢弃。

```yaml
provider_routing:
  require_parameters: true
```

### `data_collection`

控制提供商是否可使用你的提示进行训练。选项是 `"allow"` 或 `"deny"`。

```yaml
provider_routing:
  data_collection: "deny"
```
