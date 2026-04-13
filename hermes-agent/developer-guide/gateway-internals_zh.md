---
title: "Gateway 内部机制"
description: "Hermes 消息平台网关的架构、消息流、授权、投递、hook 和进程管理。"
---

# Gateway 内部机制

Gateway 让 Hermes Agent 能运行在 Telegram、Discord、Slack、Email、Webhook 等消息平台上。它负责平台事件接入、授权、会话映射、Agent 调用和响应投递。

## 关键文件

- `gateway/run.py`
- `gateway/session.py`
- `gateway/delivery.py`
- `gateway/pairing.py`
- `gateway/hooks.py`
- `gateway/platforms/`
- `gateway/status.py`

## 架构总览

平台适配器把外部事件转换成统一 `MessageEvent`。`GatewayRunner` 负责授权、构造 session key、创建或恢复 `AIAgent`，然后把最终响应交给 delivery 层发送回平台。

## 消息流

典型流向：

`Platform event -> Adapter -> MessageEvent -> GatewayRunner -> Authorization -> SessionStore -> AIAgent -> Delivery -> Platform`

### Session Key 格式

Session key 通常由平台、用户、频道或线程等字段组成。设计目标是同一对话复用历史，不同用户或线程彼此隔离。

### 双层消息保护

Gateway 会同时做平台层和 Agent 层的消息保护，避免重复消息、递归触发或并发回合互相踩踏。

## 授权

Gateway 需要判断消息发送者是否允许访问 Agent。

### DM Pairing Flow

私聊配对流程用于把平台账号和 Hermes 用户或 profile 绑定起来，避免任意陌生用户直接控制 Agent。

## Slash Command Dispatch

slash 命令会在进入普通 Agent 对话前被识别并分发，例如切换模型、查看状态或管理会话。

### Running-Agent Guard

如果某个 session 已经有 Agent 在运行，Gateway 会阻止同一 session 的并发请求直接叠加，以免会话状态混乱。

## 配置来源

配置可能来自：

- `config.yaml`
- 环境变量；
- profile；
- 平台专属配置；
- CLI 启动参数。

## 平台适配器

适配器负责平台协议边界，包括收消息、发消息、处理附件、webhook / polling 和 token 管理。

### Token Locks

某些平台 token 不能被多个进程同时使用。Token lock 可以阻止多个 gateway 实例同时抢占同一个 token。

## 投递路径

Delivery 层负责把 Agent 输出转成平台消息，并处理：

- 长消息拆分；
- markdown / 格式降级；
- 附件；
- 错误消息；
- cross-platform delivery。

## Hooks

Hook 允许在 gateway 生命周期中插入自定义逻辑。

### Gateway Hook Events

典型事件包括：

- 消息接收前后；
- Agent 执行前后；
- 投递前后；
- 错误发生；
- session 创建或关闭。

## Memory Provider 集成

Gateway 会话结束或达到特定时机时，可以触发 memory provider 刷新，把重要信息写入长期记忆。

### Memory Flush 生命周期

flush 应该发生在安全点，避免在 Agent 仍运行时读取不完整状态。

## 后台维护

Gateway 可能会运行后台任务，例如清理锁、刷新状态、维护 session store 或处理延迟投递。

## 进程管理

`gateway/status.py` 等模块会跟踪 profile 作用域内的 gateway 进程，避免重复启动、遗留锁或状态不一致。

## 相关文档

- [Session Storage](./session-storage_zh.md)
- [Adding a Platform Adapter](./adding-platform-adapters_zh.md)
- [Agent Loop Internals](./agent-loop_zh.md)
