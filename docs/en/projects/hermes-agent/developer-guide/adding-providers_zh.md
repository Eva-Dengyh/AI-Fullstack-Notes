---
title: "添加 Provider"
description: "如何为 Hermes Agent 新增模型提供方：认证、模型目录、运行时解析与适配器支持。"
---

# 添加 Provider

新增 provider 时，最重要的原则是：先判断它属于“OpenAI 兼容 provider”还是“原生 provider”。这会直接决定你要改的文件和需要接入的 API mode。

## 心智模型

Hermes 的 provider 接入不是只改一处配置，而是让一整条链打通：

- 认证；
- 模型目录；
- 运行时解析；
- CLI 选择与展示；
- 辅助模型路径；
- 必要时的原生适配器和 `run_agent.py` 分支。

## 先选实现路径

### 路径 A：OpenAI 兼容 provider

如果该 provider 支持标准 OpenAI 风格接口，一般可以复用现有 `chat_completions` 逻辑，重点工作是：

- 增加 auth 元数据；
- 增加模型列表和别名；
- 正确配置 `base_url`；
- 验证 CLI 和辅助模型路径。

### 路径 B：原生 provider

如果 provider 有自己的消息格式、工具调用协议或特殊字段，就需要新增适配器，并在 `run_agent.py` 中加入专门分支。

## 文件清单

### 每个内置 provider 都要改的文件

- `hermes_cli/auth.py`
- `hermes_cli/models.py`
- `hermes_cli/runtime_provider.py`
- `hermes_cli/main.py`

### 原生 / 非 OpenAI provider 额外要改的文件

- `agent/<provider>_adapter.py` 或等效适配器文件
- `run_agent.py`
- 可能还有缓存、辅助模型和 provider 特定请求字段相关代码

## 第 1 步：选一个规范 provider id

整个系统里只保留一个规范 provider 标识，其它字符串尽量通过别名归一化。不要在不同模块里混用多个名字。

## 第 2 步：在 `hermes_cli/auth.py` 中加入认证元数据

这里定义 provider 的认证方式、环境变量、是否支持 OAuth、展示名称等。认证元数据是 CLI setup 与运行时取 key 的基础。

## 第 3 步：在 `hermes_cli/models.py` 中加入模型目录和别名

这里负责：

- 模型列表；
- provider 到模型的映射；
- 人类可读名称；
- 模型别名与解析。

如果这一步漏掉，CLI 可能能配置 provider，但无法识别或切换模型。

## 第 4 步：在 `hermes_cli/runtime_provider.py` 中解析运行时数据

这里是 provider 接入的关键层，负责把配置转成：

- `api_mode`
- `api_key`
- `base_url`
- provider 特定参数

## 第 5 步：在 `hermes_cli/main.py` 中接上 CLI

CLI 必须能：

- 识别新的 provider；
- 在 setup、`/model` 或其它命令中展示；
- 正确处理 provider + model 的配置与切换。

## 第 6 步：保证辅助调用路径仍可工作

除了主对话模型，还要检查辅助模型路径。

### `agent/auxiliary_client.py`

如果辅助调用会通过 provider 发送请求，这里可能需要更新。

### `agent/model_metadata.py`

如果新模型的上下文长度、能力标签或 token 估算依赖元数据，这里也要同步维护。

## 第 7 步：如果是原生 provider，加入适配器和 `run_agent.py` 支持

### 新适配器文件

适配器负责把 Hermes 内部统一消息格式转换成 provider 原生请求格式，并把响应再转回统一结构。

### `run_agent.py`

`AIAgent` 中通常需要为原生 provider 增加专门分支，用于：

- 构建请求；
- 处理工具调用；
- 解析响应；
- 处理流式输出或缓存。

### Prompt caching 与 provider 特定字段

如果 provider 支持缓存、推理开关、额外 headers 或其它特有参数，也需要在这里准确处理。

## 第 8 步：测试

至少覆盖：

- provider 能被正确配置；
- 模型解析正确；
- 主会话路径能正常跑通；
- 工具调用不中断；
- 辅助模型路径不报错。

## 第 9 步：在线验证

完成本地实现后，最好做一次真实请求验证，确认：

- 认证无误；
- 请求走到了正确 endpoint；
- provider 特有参数没有误发；
- 响应格式被正确解析。

## 第 10 步：更新用户文档

如果 provider 面向终端用户可见，就应该同步更新用户文档、配置说明和 setup 指南。

## OpenAI 兼容 provider 检查表

- [ ] 认证元数据已加入
- [ ] 模型目录与别名已加入
- [ ] 运行时能解析 `base_url`
- [ ] CLI 能展示和切换
- [ ] 辅助路径已验证

## 原生 provider 检查表

- [ ] 新增适配器
- [ ] `run_agent.py` 已接入
- [ ] 工具调用协议已验证
- [ ] 缓存 / 流式 / 额外字段已处理
- [ ] 辅助路径已验证

## 常见坑

### 1. 在 auth 中加了 provider，但模型解析没加

这样会导致 provider 可配置，但模型无法识别或切换。

### 2. 忘了 `config["model"]` 可能是字符串也可能是 dict

实现时不要假设配置结构永远固定。

### 3. 误以为必须做成内置 provider

并不是所有 provider 都必须深度内置；某些场景下自定义 OpenAI 兼容 `base_url` 就够了。

### 4. 忘了辅助路径

主聊天能跑，不代表压缩、视觉或摘要等辅助路径也能跑。

### 5. `run_agent.py` 里隐藏的原生 provider 分支

接入原生 provider 时，真正的复杂度往往在这里，而不是在 CLI 配置层。

### 6. 把只属于 OpenRouter 的参数发给其他 provider

provider 特定参数必须严格按目标 provider 下发。

### 7. 改了 `hermes model`，却没改 `hermes setup`

用户能在一个地方选到，不代表另一个入口也已经支持。

## 实现时值得搜索的目标

可以优先在代码中搜索：

- 现有 provider id
- `PROVIDER_REGISTRY`
- `runtime_provider`
- `api_mode`
- `auxiliary_client`
- 某个原生 provider 的适配器实现

## 相关文档

- [Provider Runtime Resolution](./provider-runtime_zh.md)
- [Architecture](./architecture_zh.md)
- [Contributing](./contributing_zh.md)
