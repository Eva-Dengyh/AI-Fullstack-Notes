---
title: "工具运行时"
description: "Hermes 工具注册、toolset 解析、dispatch、审批流程与终端运行环境。"
---

# 工具运行时

Hermes 的工具运行时围绕一个中心概念展开：**注册表**。工具模块在导入时自注册，运行时再根据平台、配置和可用性筛选出当前请求真正能用的工具集合。

## 工具注册模型

每个工具通常定义：

- schema；
- handler；
- `check_fn`；
- 所属 toolset；
- 可选的异步标记、环境变量依赖和元数据。

### `registry.register()` 如何工作

当工具模块被导入时，`registry.register()` 会把上述信息写入中央注册表。之后，schema 收集、可用性检查和 dispatch 都围绕这份注册信息完成。

### 工具发现：`_discover_tools()`

Hermes 并不是扫描整个目录自动导入工具，而是通过 `model_tools.py` 中的 `_discover_tools()` 明确列出要导入的工具模块。这样做能让工具集更可控，也能避免无意加载实验性模块。

## 工具可用性检查（`check_fn`）

`check_fn` 的作用是在“把工具暴露给模型之前”先判断当前环境能否使用它。例如：

- API key 是否存在；
- 外部依赖是否安装；
- 某后端是否可达。

如果返回 `False`，工具通常不会出现在本轮模型定义中。

## Toolset 解析

Toolset 是对工具的分组与裁剪机制。不同平台、模式或配置可以暴露不同的工具组合。

### `get_tool_definitions()` 如何过滤工具

运行时会同时考虑：

- 当前启用的 toolset；
- 工具本身是否注册；
- `check_fn` 是否通过；
- 平台或 profile 是否禁用了该工具。

### 旧版 toolset 名称

Hermes 对部分历史名称保留兼容层，因此改动 toolset 时要注意别名与旧配置的兼容性。

## Dispatch

### 分发流：模型 `tool_call` 到 handler 执行

标准链路是：

`tool_call -> 找到 registry entry -> 校验参数 -> 执行 handler -> 返回 JSON 字符串 -> 回填给模型`

### 错误包装

工具错误不应该直接炸穿会话循环，而应被包装成结构化错误返回给上层或模型。这既利于调试，也避免一次工具失败导致整个 Agent 直接崩掉。

### Agent-loop 工具

少数工具需要 Agent 自身状态，因此不会完全通过通用 dispatch，而是会在 `run_agent.py` 中被特殊处理。

### 异步桥接

对 `is_async=True` 的工具，运行时会桥接异步执行与同步调用方，无需工具作者手工处理事件循环。

## `DANGEROUS_PATTERNS` 审批流

终端相关工具在执行命令前，会先经过危险模式检测。命中规则时，系统会触发审批回调，而不是直接执行高风险命令。

这套机制的目标是：

- 避免明显破坏性命令无提示执行；
- 允许不同入口层提供不同审批 UI；
- 把“安全判断”放在统一位置，而不是散落到各工具里。

## 终端 / 运行环境

Hermes 的终端能力不只支持本机环境，还支持多种 backend，例如本地、Docker、SSH、Daytona、Modal、Singularity。工具运行时会负责把相同的工具调用映射到对应后端。

## 并发

工具运行时在某些情况下支持并发执行，但前提是：

- 工具之间没有共享可变状态冲突；
- 调用顺序不影响语义；
- 上层入口允许并发回填结果。

并发能提升性能，但也会提高调试复杂度，因此通常只在明确安全的场景中开启。

## 相关文档

- [Agent Loop Internals](./agent-loop_zh.md)
- [Adding Tools](./adding-tools_zh.md)
- [Architecture](./architecture_zh.md)
