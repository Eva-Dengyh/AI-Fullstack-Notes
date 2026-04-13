---
title: "Agent Loop 内部机制"
description: "AIAgent 会话循环的职责、API 模式、工具执行与压缩持久化。"
---

# Agent Loop 内部机制

`AIAgent` 是 Hermes Agent 的执行核心。不同入口最终都会调用它来完成“构建提示词 -> 调模型 -> 执行工具 -> 保存结果”的回合循环。

## 核心职责

`AIAgent` 负责：

- 维护消息历史；
- 组装系统提示与上下文；
- 选择 provider 与 API mode；
- 处理工具调用；
- 执行重试、回退模型和预算控制；
- 在需要时压缩上下文并持久化会话。

## 两个入口

对外通常有两种使用方式：

```python
# 简单接口：返回最终字符串
response = agent.run_conversation("hello")

# 完整接口：返回消息、元数据、usage 等结构
result = agent.run_conversation_full("hello")
```

前者适合 CLI 或简单脚本，后者适合需要细粒度元数据的上层系统。

## API 模式

Hermes 会根据 provider 和模型，把请求路由到不同 API 模式，例如：

- `chat_completions`
- `codex_responses`
- `anthropic_messages`

这样做的目标不是抽象成“最低公共分母”，而是在统一 Agent 循环下兼容各 provider 的原生能力。

## 回合生命周期

一个典型回合会经历：

1. 接收用户输入并追加到消息列表；
2. 构建系统提示与上下文层；
3. 解析 provider 运行时配置；
4. 发起 API 调用；
5. 如模型返回工具调用，则执行工具并回填工具结果；
6. 继续下一轮，直到拿到最终回答；
7. 记录 usage、状态与会话历史。

### 消息格式

内部消息会被规整为统一结构，再在 API 边界转换成 provider 需要的格式。这样可以让 CLI、gateway、cron 和 ACP 共用同一条会话执行链。

### 消息交替规则

某些 provider 对消息顺序和角色交替更敏感，`AIAgent` 会在请求前做必要的整理，避免产生非法消息序列。

## 可中断的 API 调用

长时间推理或工具密集型回合中，调用可能需要被取消或中断。为此，Agent 层会保存当前运行态，并给上层入口提供取消钩子。

## 工具执行

### 串行与并发

默认情况下，工具调用会按模型输出的顺序执行；对于某些可以安全并发的场景，运行时也可以使用并发执行策略以降低总耗时。

### 执行流

典型流程如下：

`model tool_call -> schema 校验 -> registry dispatch -> handler 执行 -> JSON 结果 -> 回填消息 -> 继续推理`

### Agent 级工具

像 `memory`、`todo`、`delegate_task` 这类工具不只是普通函数，它们需要访问会话或 Agent 运行态，因此通常会在 registry 分发前先由 `run_agent.py` 拦截处理。

## 回调表面

Agent 会暴露多种回调能力给上层：

- 澄清提问；
- 危险命令审批；
- sudo 权限请求；
- 流式输出显示；
- 取消与中断。

这使得 CLI、gateway 和 ACP 可以共享同一套底层执行逻辑，但保留不同的交互方式。

## 预算与回退行为

### 迭代预算

为防止模型陷入无限工具循环，Agent 会维护迭代上限。达到上限后，要么终止，要么返回带说明的失败结果，具体取决于调用场景。

### 回退模型

如果主模型不可用、超时或命中某些 provider 级错误，系统可以尝试回退模型。回退是运行时策略的一部分，不是所有调用路径都支持。

## 压缩与持久化

### 何时触发压缩

当上下文接近模型窗口阈值时，Agent 会触发压缩逻辑，以保留近期消息和关键决策，同时移除冗长中间过程。

### 压缩时会发生什么

通常会先裁剪旧工具结果，再对中间消息生成结构化摘要，并把“压缩后的历史”替换到会话上下文中。

### 会话持久化

在每轮执行中，消息、标题、token usage 和 lineage 都会被写入会话存储层。这样 CLI、gateway 和其他入口都能复用统一的历史与搜索能力。

## 关键源码文件

- `run_agent.py`
- `agent/prompt_builder.py`
- `hermes_cli/runtime_provider.py`
- `model_tools.py`
- `tools/registry.py`
- `agent/context_compressor.py`
- `hermes_state.py`

## 相关文档

- [Architecture Overview](./architecture_zh.md)
- [Prompt Assembly](./prompt-assembly_zh.md)
- [Provider Runtime Resolution](./provider-runtime_zh.md)
- [Tools Runtime](./tools-runtime_zh.md)
- [Session Storage](./session-storage_zh.md)
