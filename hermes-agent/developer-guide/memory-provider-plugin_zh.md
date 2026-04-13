---
title: "构建 Memory Provider 插件"
description: "如何实现 Hermes 记忆提供器插件，包括接口、配置、生命周期和 CLI 扩展。"
---

# 构建 Memory Provider 插件

Memory Provider 插件用于替换或扩展 Hermes 的长期记忆后端。它可以把记忆存到本地文件、数据库、向量库或外部服务中。

## 目录结构

一个典型 provider 插件包含：

- `plugin.yaml`
- provider Python 模块；
- 可选 `cli.py`；
- 配置 schema；
- 测试文件。

## `MemoryProvider` ABC

插件必须实现 `MemoryProvider` 抽象接口。该接口定义记忆读写、配置、生命周期和可选 hook。

## 必需方法

### 核心生命周期

通常包括初始化、加载、刷新、关闭等方法。实现时要能处理异常中断和重复初始化。

### Config

插件应声明自己的配置字段、默认值和校验逻辑。不要假设用户一定提供完整配置。

### 可选 Hooks

可选 hook 可用于在会话结束、消息追加或 memory flush 时执行额外逻辑。

## Config Schema

配置 schema 用于让 Hermes 知道这个 provider 支持哪些参数、参数类型是什么，以及哪些字段是必填项。

## Save Config

如果插件允许通过 CLI 修改配置，需要实现保存配置的逻辑，并确保写入 profile 对应路径。

## Plugin Entry Point

入口点负责把 provider 注册给 Hermes。加载失败时应给出清晰错误，而不是静默禁用。

## `plugin.yaml`

`plugin.yaml` 描述插件名称、版本、入口点、能力和配置元数据。它是插件发现和加载的入口。

## 线程约定

Memory provider 可能在不同上下文被调用。实现时要明确哪些方法是线程安全的，并对共享状态加锁或避免共享。

## Profile 隔离

记忆必须按 profile 隔离，不能把所有 profile 共用一个存储路径。

```python
# CORRECT — profile-scoped
# WRONG — shared across all profiles
```

## 测试

建议测试：

```bash
# Test tool routing
# Test lifecycle
```

重点确认 provider 能加载、能读写、能 flush、能在多 profile 下隔离。

## 添加 CLI 命令

### 工作方式

Memory provider 可以附带 CLI 扩展，让用户管理、查看或迁移记忆。

### 示例

```python
# plugins/memory/my-provider/cli.py
```

### 参考实现

优先查看已有 memory provider 插件，保持配置、命令和错误信息风格一致。

### 带 CLI 的目录结构

带 CLI 的插件通常会多一个 `cli.py` 或 command registration 文件，并在 `plugin.yaml` 中声明。

## 单 Provider 规则

通常同一 profile 下只应有一个主 memory provider，避免多个 provider 同时写入导致状态不一致。
