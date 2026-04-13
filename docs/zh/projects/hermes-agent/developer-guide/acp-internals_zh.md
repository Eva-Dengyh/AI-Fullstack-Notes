---
title: "ACP 内部机制"
description: "Hermes ACP 适配层的启动流程、会话管理、权限桥接和当前限制。"
---

# ACP 内部机制

ACP 适配层让 Hermes Agent 能被 VS Code、Zed、JetBrains 等支持 ACP 的客户端调用。它把编辑器侧事件转换成 Hermes 内部可理解的会话、消息、工具调用和权限请求。

## 启动流程

启动时，ACP 服务会：

1. 初始化配置和 provider 运行时；
2. 创建 ACP server；
3. 注册可供客户端调用的能力；
4. 为每个客户端 session 创建对应的 Hermes agent session；
5. 建立事件桥接和权限回调。

## 主要组件

### `HermesACPAgent`

这是 ACP 层对 Hermes Agent 的封装。它负责把 ACP 请求转成 `AIAgent` 调用，并把 Hermes 的响应转换回 ACP 客户端需要的事件格式。

### `SessionManager`

会话管理器维护 ACP session 与 Hermes session 的映射。它负责创建、恢复、取消和 fork 会话，并隔离不同编辑器上下文。

### 事件桥

事件桥用于把 Hermes 内部的输出、工具状态和流式结果传给 ACP 客户端。它的目标是让编辑器能实时展示 Agent 的执行过程。

### 权限桥

ACP 客户端通常需要参与工具审批，例如 shell 命令、文件写入或高风险操作。权限桥会把 Hermes 的 approval callback 转成 ACP 侧可展示的权限请求。

### 工具渲染辅助函数

工具调用和工具结果在 CLI 中可以直接打印，但在 IDE 里需要更结构化的展示。ACP 层会提供一些格式化逻辑，帮助客户端展示工具名称、参数和状态。

## 会话生命周期

会话通常从客户端发起新请求开始，绑定到一个工作目录和 session id。后续消息会复用该 session，直到用户取消、fork 或客户端关闭。

### 取消

取消操作需要同时通知 ACP 层和正在运行的 `AIAgent`。如果有正在进行的 API 调用或工具执行，系统会尽量触发中断并清理运行态。

### Fork

Fork 用于从某个历史点创建新的会话分支。ACP 层需要保持 lineage 信息，使编辑器端可以理解分支来自哪里。

## Provider / Auth 行为

ACP 不应该重新实现一套 provider 认证逻辑，而是复用 Hermes 的运行时解析和凭据加载机制。这样 CLI 与 IDE 的模型选择行为才能保持一致。

## 工作目录绑定

IDE 场景中的工作目录很关键。ACP session 通常绑定到客户端传入的 workspace root，这会影响：

- 上下文文件发现；
- 文件工具默认路径；
- 终端命令执行目录；
- profile 感知路径。

## 同名工具调用去重

某些客户端或模型可能会生成重复的同名工具调用。ACP 层需要确保展示和回填时不会混淆工具 call id 或把结果写回错误的调用。

## 审批回调恢复

会话恢复或 fork 后，审批回调也必须恢复到正确的客户端通道。否则工具执行会卡在等待审批状态，或者把审批请求发送给错误的前端。

## 当前限制

当前 ACP 集成仍受限于客户端协议和 Hermes 内部同步执行模型。常见限制包括：

- 某些工具结果展示不如 CLI 丰富；
- 长任务取消不一定能立即终止外部进程；
- 不同客户端对权限请求 UI 的支持程度不同；
- fork 和恢复行为依赖客户端实现质量。

## 相关文件

- `acp_adapter/`
- `run_agent.py`
- `hermes_cli/runtime_provider.py`
- `tools/registry.py`
- `hermes_state.py`
