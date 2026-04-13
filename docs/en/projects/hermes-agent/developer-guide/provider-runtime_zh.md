---
title: "Provider 运行时解析"
description: "Hermes 如何把 provider / model 选择解析成真实的 API 模式、认证信息和路由配置。"
---

# Provider 运行时解析

Provider 运行时解析负责把用户配置中的 `(provider, model)` 组合转换为最终可执行的请求参数，例如：

- `api_mode`
- `api_key`
- `base_url`
- provider 特定请求字段

这个解析层被 CLI、Gateway、Cron、ACP 以及辅助模型调用共享。

## 解析优先级

通常遵循“越具体越优先”的原则：

1. 显式传入的运行时参数；
2. 当前 profile / session 配置；
3. provider 默认配置；
4. 内置回退逻辑或别名映射。

## Providers

Hermes 同时支持：

- OpenAI 兼容 provider；
- 原生 provider（如 Anthropic）；
- 聚合网关（如 OpenRouter、AI Gateway）；
- 自定义 `base_url` 的兼容后端。

对外看起来只是切换 provider，但内部会根据能力差异选择不同的 API mode 和适配器。

## 运行时解析的输出

一个解析结果通常会包含：

- 实际使用的 provider id；
- 标准化后的 model 名；
- 请求应走的 API mode；
- 认证信息；
- 是否支持特定功能，如 fallback、cache、流式输出等。

## 为什么这很重要

如果没有统一运行时解析：

- CLI、gateway、cron 会各自实现一套 provider 逻辑；
- 模型别名与 provider 认证会四处分散；
- 新增 provider 会变成高风险改动。

把解析集中到一层后，绝大多数上层代码都只需要“拿到结果然后调用”。

## AI Gateway

AI Gateway 类 provider 往往不是一个模型提供方本身，而是一个统一入口。Hermes 会在解析时决定：

- 请求是否仍走 OpenAI 兼容路径；
- 是否需要 provider 级 headers / base URL；
- 模型名是否需要额外标准化。

## OpenRouter、AI Gateway 与自定义 OpenAI 兼容 `base_url`

这些 provider 共通点是“接口形状相近”，但差异点在于：

- 默认 `base_url` 不同；
- 认证头与额外字段不同；
- 可用模型列表与别名不同；
- 某些 provider 独有参数不能错误地下发给其他后端。

因此实现时要特别注意只在目标 provider 上发送对应的 knobs。

## 原生 Anthropic 路径

Anthropic 不是简单的 OpenAI 兼容层。Hermes 需要走其原生消息 API，并在消息格式、缓存字段和工具调用表示上做专门适配。

## OpenAI Codex 路径

部分模型需要用 `codex_responses` 一类的专用 API mode，而不是普通 `chat_completions`。运行时解析会把这类模型正确路由到对应调用链。

## 辅助模型路由

Hermes 中不止主对话模型需要 provider 解析。辅助任务例如：

- 视觉分析；
- 摘要；
- 元数据推断；
- 压缩；

也会使用同一套路由逻辑，以保证认证、基地址和 provider 行为一致。

## 回退模型

### 内部工作方式

当主模型失败且当前路径支持 fallback 时，运行时会尝试切换到备用模型或备用 provider，并继续当前流程。

### 不支持 fallback 的场景

并非所有模式都支持透明回退。典型限制包括：

- provider 原生 API 行为差异过大；
- 某些专用模型只支持特定 endpoint；
- 工具调用协议不完全一致。

### 测试覆盖

新增 provider 或修改运行时解析时，应至少验证：

- 主路径是否能正确解析；
- 别名是否能展开；
- 辅助模型路径是否未被破坏；
- fallback 分支是否仍工作。

## 相关文档

- [Agent Loop Internals](./agent-loop_zh.md)
- [Adding Providers](./adding-providers_zh.md)
- [Prompt Assembly](./prompt-assembly_zh.md)
- [Architecture](./architecture_zh.md)
