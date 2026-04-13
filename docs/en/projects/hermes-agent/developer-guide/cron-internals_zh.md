---
title: "Cron 内部机制"
description: "Hermes 定时任务系统的作业模型、调度循环、技能注入和结果投递。"
---

# Cron 内部机制

Cron 子系统让 Hermes 能按计划运行 Agent 任务，例如每日摘要、定期检查、自动报告和后台监控。

## 关键文件

主要代码分布在：

- `cron/jobs.py`
- `cron/scheduler.py`
- `gateway/` 中的投递与集成路径
- CLI 中的 cron 管理命令

## 调度模型

调度器按 tick 周期扫描作业定义，找出到期任务，创建独立 Agent 执行，然后更新下次运行时间。

## 作业存储

作业通常存储在 `jobs.json` 或 profile 感知路径下的等效文件中。每个 job 包含 schedule、prompt、目标平台、状态和运行元数据。

### 作业生命周期状态

常见状态包括：

- pending；
- running；
- succeeded；
- failed；
- disabled。

### 向后兼容

作业格式变化时，需要兼容旧字段或提供迁移逻辑，避免用户升级后已有 cron job 全部失效。

## 调度器运行时

### Tick Cycle

每个 tick 会：

1. 加载作业；
2. 判断哪些作业到期；
3. 获取锁；
4. 创建 fresh Agent；
5. 执行 prompt；
6. 投递结果；
7. 写回状态与 `next_run`。

### Gateway 集成

Cron 可以把结果投递到消息平台，因此会复用 gateway 的 delivery 路径，而不是每个平台单独写一套。

### 新会话隔离

Cron 任务通常不复用用户聊天历史，而是创建干净会话，避免定时任务被历史对话污染。

## Skill-backed Jobs

Cron job 可以附带技能，让 Agent 在运行前获得特定工作流说明。

### Script-backed Jobs

有些 job 先运行脚本，再让 Agent 分析脚本输出。

```python
# ~/.hermes/scripts/check_competitors.py
# Fetch competitor release notes, diff against last run
# Print summary to stdout — agent analyzes and reports
```

### Provider Recovery

如果 provider 短暂失败，cron 路径应尽量遵守运行时回退和重试策略，但不能无限重试阻塞调度循环。

## 投递模型

### 响应包装

Agent 结果在投递前可能会加上任务名、运行时间、状态或错误摘要，帮助接收者理解这是一条 cron 输出。

### 会话隔离

即使投递到同一平台，cron 的执行会话也应与普通用户消息隔离，避免污染用户历史。

## 递归保护

如果 cron 输出又触发 gateway 监听，系统需要避免形成“任务触发消息，消息再触发任务”的递归循环。

## 锁

锁用于避免同一作业被多个进程或 profile 同时执行，也用于保护 token / delivery 资源。

## CLI 接口

CLI 通常提供添加、列出、启用、禁用、运行和删除 cron job 的命令。

## 相关文档

- [Gateway Internals](./gateway-internals_zh.md)
- [Agent Loop Internals](./agent-loop_zh.md)
- [Provider Runtime Resolution](./provider-runtime_zh.md)
