---
title: "Honcho 内存"
description: "通过 Honcho 的 AI 原生持久内存 — 辩证推理、多 Agent 用户建模和深度个性化"
---

# Honcho 内存

[Honcho](https://github.com/plastic-labs/honcho) 是一个 AI 原生内存后端，在 Hermes 的内置内存系统之上添加辩证推理和深度用户建模。而不是简单的键值存储，Honcho 维护用户是谁的运行模型 — 他们的偏好、通信风格、目标和模式 — 通过推理对话后发生的事。

:::info Honcho 是一个内存提供商插件
Honcho 集成到 [Memory Providers](./memory-providers.md) 系统。下面所有功能通过统一的内存提供商界面可用。
:::

## Honcho 添加什么

| 能力 | 内置内存 | Honcho |
|-----------|----------------|--------|
| 跨会话持久化 | ✔ 基于文件 MEMORY.md/USER.md | ✔ 服务器端带 API |
| 用户 profile | ✔ 手动 Agent 策划 | ✔ 自动辩证推理 |
| 多 Agent 隔离 | — | ✔ 每个对等 profile 分离 |
| 观察模式 | — | ✔ 统一或方向性观察 |
| 结论（推导见解） | — | ✔ 关于模式的服务器端推理 |
| 跨历史搜索 | ✔ FTS5 会话搜索 | ✔ 结论上的语义搜索 |

**辩证推理**：在每个对话后，Honcho 分析交换并导出"结论" — 关于用户偏好、习惯和目标的见解。这些结论累积随时间，给 Agent 深化的理解超越用户显式陈述的。

**多 Agent profiles**：当多个 Hermes 实例与同一用户对话时（例如编程助手和个人助手），Honcho 维护单独的"对等"profiles。每个对等只看到自己的观察和结论，防止上下文交叉污染。

## 设置

```bash
hermes memory setup    # 从提供商列表选择 "honcho"
```

或手动配置：

```yaml
# ~/.hermes/config.yaml
memory:
  provider: honcho
```

```bash
echo "HONCHO_API_KEY=your-key" >> ~/.hermes/.env
```

获取 API 密钥在 [honcho.dev](https://honcho.dev)。

## 配置选项

```yaml
# ~/.hermes/config.yaml
honcho:
  observation: directional    # "unified"（新安装默认）或 "directional"
  peer_name: ""               # 从平台自动检测，或手动设置
```

**观察模式：**
- `unified` — 所有观察进入单个池。更简单，对单 Agent 设置好。
- `directional` — 观察用方向标记（user→agent、agent→user）。启用更丰富的对话动态分析。

## 工具

当 Honcho 活跃作为内存提供商时，四个额外的工具变得可用：

| 工具 | 目的 |
|------|---------|
| `honcho_conclude` | 在最近对话上触发服务器端辩证推理 |
| `honcho_context` | 从 Honcho 的内存为当前对话检索相关上下文 |
| `honcho_profile` | 查看或更新用户的 Honcho profile |
| `honcho_search` | 跨所有存储的结论和观察进行语义搜索 |

## CLI 命令

```bash
hermes honcho status          # 显示连接状态和配置
hermes honcho peer            # 更新多 Agent 设置的对等名称
```

## 从 `hermes honcho` 迁移

如果你之前使用过独立的 `hermes honcho setup`：

1. 你现有的配置（`honcho.json` 或 `~/.honcho/config.json`）被保留
2. 你的服务器端数据（内存、结论、用户 profiles）是完整的
3. 在 config.yaml 中设置 `memory.provider: honcho` 以重新激活

无需重新登录或重新设置。运行 `hermes memory setup` 并选择 "honcho" — 向导检测你现有的配置。

## 完整文档

见 [Memory Providers — Honcho](./memory-providers.md#honcho) 了解完整参考。
