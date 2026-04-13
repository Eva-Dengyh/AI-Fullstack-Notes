---
title: "构建 Context Engine 插件"
description: "如何实现可插拔上下文引擎，替换或扩展 Hermes 默认上下文压缩逻辑。"
---

# 构建 Context Engine 插件

Context Engine 插件允许你替换 Hermes 默认的上下文压缩和上下文管理策略。它适合需要自定义摘要、检索、长期上下文组织或外部记忆系统的场景。

## 工作方式

通过配置指定插件后，Hermes 会在运行时加载你的 engine，并让它参与上下文处理流程。

```yaml
# config.yaml
```

## 目录结构

一个典型插件目录包含：

- `plugin.yaml`：插件元数据；
- Python entrypoint：返回或注册 engine；
- 可选配置 schema；
- 可选测试文件。

## `ContextEngine` ABC

你的实现需要遵循 `ContextEngine` 抽象基类的接口，至少能处理压缩或上下文构建相关操作。

### Engine 必须维护的类属性

通常需要维护：

- engine 名称；
- 配置；
- 当前状态；
- 与会话或 profile 相关的隔离信息。

### 可选方法

根据需求可以实现额外钩子，例如：

- 初始化；
- 关闭；
- 工具暴露；
- 状态导出；
- 调试信息。

## Engine 工具

Context Engine 可以暴露专属工具，允许模型查询、更新或检查上下文状态。工具设计时仍要遵守普通工具的 schema 和安全规则。

## 注册

### 通过目录注册（推荐）

推荐把插件放在约定目录下，让 Hermes 通过目录发现加载。

### 通过通用插件系统注册

如果你的插件还包含 CLI 命令、hook 或其它能力，可以走通用插件系统。

## 生命周期

插件一般会经历：

1. 发现；
2. 读取配置；
3. 初始化；
4. 参与会话；
5. 关闭或刷新状态。

要确保它能在多 profile、多会话和异常中断时保持状态隔离。

## 配置

配置应尽量声明清楚默认值、必填项和安全边界。不要假设用户一定设置了所有字段。

## 测试

建议测试：

- 插件能被发现和加载；
- 配置缺失时能给出清晰错误；
- 压缩输出格式稳定；
- 多 session 不串状态；
- 工具暴露符合预期。

## 另请参阅

- [Context Compression and Caching](./context-compression-and-caching_zh.md)
- [Memory Provider Plugin](./memory-provider-plugin_zh.md)
- [Architecture](./architecture_zh.md)
