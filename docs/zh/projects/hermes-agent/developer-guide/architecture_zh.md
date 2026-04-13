---
sidebar_position: 1
title: "架构"
description: "Hermes Agent 内部总览：主要子系统、执行路径、数据流，以及建议的阅读顺序。"
---

# 架构

本页是 Hermes Agent 内部实现的总地图。建议先用它建立代码库心智模型，再继续阅读各个子系统的专题文档。

## 系统总览

Hermes Agent 的入口大体分为三类：

- `CLI (cli.py)`：交互式终端入口。
- `Gateway (gateway/run.py)`：消息平台入口，例如 Telegram、Discord、Slack。
- `ACP (acp_adapter/)`：IDE / 编辑器集成入口。

这些入口最终都会汇聚到 `AIAgent`（位于 `run_agent.py`）驱动统一的会话循环。这个循环负责：

- 构建系统提示词；
- 解析并选择运行时 provider；
- 调用模型 API；
- 分发工具调用；
- 持久化会话状态与历史消息。

围绕 `AIAgent`，项目又分出几个核心模块：

- Prompt Builder：拼装系统提示、技能、上下文文件与模型指令。
- Provider Resolution：把 `(provider, model)` 解析为真实的 API 模式、认证信息与基地址。
- Tool Dispatch：收集工具 schema、检查可用性、执行 handler 并包装错误。
- Compression & Caching：在上下文过长时做压缩，并在支持的 provider 上使用提示缓存。

状态与外部能力主要来自两个方向：

- Session Storage：基于 SQLite + FTS5 的会话数据库。
- Tool Backends：终端、浏览器、Web、MCP、文件、视觉等工具后端。

## 目录结构

仓库可以粗略理解为以下几层：

- `run_agent.py`：`AIAgent` 主循环，整个系统的执行核心。
- `cli.py` / `hermes_cli/`：CLI 入口、命令注册、配置与认证。
- `agent/`：提示词、上下文压缩、辅助模型、记忆管理等 Agent 内部逻辑。
- `tools/`：各个工具的实现、注册与运行时支持。
- `gateway/`：消息平台网关、适配器、会话持久化、消息投递。
- `acp_adapter/`：ACP 服务，供 VS Code / Zed / JetBrains 等客户端接入。
- `cron/`：定时任务调度器。
- `plugins/`：记忆提供器、上下文引擎等插件。
- `environments/`：用于评测、SFT 数据生成和 RL 训练的环境。
- `skills/` 与 `optional-skills/`：内置和官方可选技能。
- `tests/`：测试套件。

## 数据流

### CLI 会话

典型的 CLI 数据流如下：

`User input -> HermesCLI.process_input() -> AIAgent.run_conversation() -> build_system_prompt() -> resolve_runtime_provider() -> API call -> tool calls -> final response -> SessionDB`

也就是说，CLI 只是收集输入和展示输出，真正的编排发生在 `AIAgent`。

### Gateway 消息

消息平台路径大致是：

`Platform event -> Adapter.on_message() -> GatewayRunner._handle_message() -> authorize -> resolve session key -> create AIAgent -> run_conversation() -> deliver response`

网关会在进入 Agent 之前完成授权、会话键解析和平台消息标准化。

### Cron 作业

定时任务路径则更偏后台执行：

`Scheduler tick -> load due jobs -> create fresh AIAgent -> inject skills/context -> run prompt -> deliver response -> update next_run`

Cron 作业默认使用“全新会话”，避免与用户交互会话混淆。

## 推荐阅读顺序

如果你刚接触这个代码库，推荐按下面顺序阅读：

1. 本页：先建立全局地图。
2. [Agent Loop Internals](./agent-loop_zh.md)：理解 `AIAgent` 的回合循环。
3. [Prompt Assembly](./prompt-assembly_zh.md)：理解系统提示是如何被拼出来的。
4. [Provider Runtime Resolution](./provider-runtime_zh.md)：理解 provider 选择与路由。
5. [Adding Providers](./adding-providers_zh.md)：理解新增 provider 的实际步骤。
6. [Tools Runtime](./tools-runtime_zh.md)：理解工具注册、筛选和执行。
7. [Session Storage](./session-storage_zh.md)：理解 SQLite schema、FTS5 和 lineage。
8. [Gateway Internals](./gateway-internals_zh.md)：理解消息网关。
9. [Context Compression and Caching](./context-compression-and-caching_zh.md)：理解上下文控制。
10. [ACP Internals](./acp-internals_zh.md)：理解 IDE 集成。
11. [Environments, Benchmarks & Data Generation](./environments_zh.md)：理解评测与训练环境。

## 主要子系统

### Agent Loop

`AIAgent` 是同步编排引擎，负责 provider 选择、提示构造、工具执行、重试、降级、回调、压缩和持久化。它支持多种 API 模式，以兼容不同 provider 的请求格式。

更多细节见 [Agent Loop Internals](./agent-loop_zh.md)。

### 提示词系统

提示词系统覆盖了会话的整个生命周期：

- `prompt_builder.py`：从 `SOUL.md`、记忆文件、技能、上下文文件和工具说明组装系统提示。
- `prompt_caching.py`：对 Anthropic 请求施加缓存断点。
- `context_compressor.py`：当上下文过长时压缩中间消息。

更多细节见 [Prompt Assembly](./prompt-assembly_zh.md) 和 [Context Compression and Caching](./context-compression-and-caching_zh.md)。

### Provider 解析

这是一个被 CLI、Gateway、Cron、ACP 和辅助调用共享的运行时解析层。它把逻辑上的 provider / model 选择转换为真实的 API mode、凭据和 `base_url`。

更多细节见 [Provider Runtime Resolution](./provider-runtime_zh.md)。

### 工具系统

工具系统以 `tools/registry.py` 为中心。每个工具模块在导入时注册自己，注册表负责：

- 收集 schema；
- 检查可用性；
- 过滤 toolset；
- 分发 handler；
- 包装错误；
- 桥接异步工具。

更多细节见 [Tools Runtime](./tools-runtime_zh.md)。

### 会话持久化

会话层基于 SQLite，并配有 FTS5 全文搜索。它支持：

- 会话 lineage 跟踪；
- 不同平台的隔离；
- 原子写入和争用处理；
- 会话标题、消息历史和搜索索引。

更多细节见 [Session Storage](./session-storage_zh.md)。

### 消息网关

消息网关负责把来自各平台的输入标准化后送入 `AIAgent`，再把结果路由回平台。它同时处理授权、会话映射、消息投递和后台维护。

更多细节见 [Gateway Internals](./gateway-internals_zh.md)。

### 插件系统

插件机制用于扩展记忆提供器、上下文引擎以及 CLI 侧的功能。插件既可以通过目录发现，也可以走统一的插件加载流程。

相关文档：

- [Building a Memory Provider Plugin](./memory-provider-plugin_zh.md)
- [Building a Context Engine Plugin](./context-engine-plugin_zh.md)
- [Extending the CLI](./extending-the-cli_zh.md)

### Cron

Cron 子系统提供定时任务调度能力。它从作业定义中加载待执行任务，创建独立 Agent，会话隔离运行，并把结果投递到目标平台。

更多细节见 [Cron Internals](./cron-internals_zh.md)。

### ACP 集成

ACP 为 IDE 客户端提供统一接口，使编辑器可以复用 Hermes 的 Agent、工具、权限回调和会话管理。

更多细节见 [ACP Internals](./acp-internals_zh.md)。

### RL / 环境 / 轨迹

仓库还包含面向评测、SFT 数据生成和 RL 训练的环境层。它把 `AIAgent` 封装进可重复运行的 benchmark / training runtime 中，并把轨迹以标准格式落盘。

相关文档：

- [Environments, Benchmarks & Data Generation](./environments_zh.md)
- [Trajectory Format](./trajectory-format_zh.md)

## 设计原则

Hermes Agent 的内部设计大体遵循以下原则：

- 单一会话循环：不同入口尽量复用同一个 `AIAgent` 执行核心。
- 注册优于硬编码：工具、插件、技能都尽量通过注册和发现机制接入。
- 运行时可组合：provider、toolset、memory、context engine 都允许按配置或平台切换。
- 对外能力和对内状态分离：工具负责行动，会话层负责历史与状态。
- 面向降级设计：超长上下文、provider 不兼容、工具不可用时尽量优雅退化。

## 文件依赖链

如果你在追某个请求是如何落到具体代码上的，可以用下面的心智链路：

`入口层（CLI / Gateway / ACP / Cron） -> AIAgent -> Prompt Builder / Provider Resolver / Tool Runtime -> Session Storage / 外部后端`

遇到具体问题时，一般先判断它属于哪一层，再顺着这条链往下追。
