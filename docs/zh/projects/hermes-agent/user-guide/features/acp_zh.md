---
sidebar_position: 11
title: "ACP 编辑器集成"
description: "在 ACP 兼容编辑器中使用 Hermes Agent，如 VS Code、Zed 和 JetBrains"
---

# ACP 编辑器集成

Hermes Agent 可以作为 ACP 服务器运行，让 ACP 兼容编辑器通过 stdio 与 Hermes 对话并渲染：

- 聊天消息
- 工具活动
- 文件差异
- 终端命令
- 批准提示
- 流式思考 / 响应块

ACP 是当你想要 Hermes 表现得像一个编辑器原生编码 Agent 而不是独立 CLI 或消息传递 bot 时的很好选择。

## Hermes 在 ACP 模式中公开的内容

Hermes 运行具有为编辑器工作流设计的策划 `hermes-acp` 工具集。它包括：

- 文件工具：`read_file`、`write_file`、`patch`、`search_files`
- 终端工具：`terminal`、`process`
- 网页/浏览器工具
- 内存、todo、会话搜索
- 技能
- execute_code 和 delegate_task
- 视觉

它有意排除了不符合典型编辑器 UX 的内容，如消息传递交付和 cronjob 管理。

## 安装

正常安装 Hermes，然后添加 ACP 扩展：

```bash
pip install -e '.[acp]'
```

这安装 `agent-client-protocol` 依赖并启用：

- `hermes acp`
- `hermes-acp`
- `python -m acp_adapter`

## 启动 ACP 服务器

以下任何一个在 ACP 模式中启动 Hermes：

```bash
hermes acp
```

```bash
hermes-acp
```

```bash
python -m acp_adapter
```

Hermes 记录到 stderr 以便 stdout 保留用于 ACP JSON-RPC 流量。

## 编辑器设置

### VS Code

安装 ACP 客户端扩展，然后将其指向仓库的 `acp_registry/` 目录。

示例设置片段：

```json
{
  "acpClient.agents": [
    {
      "name": "hermes-agent",
      "registryDir": "/path/to/hermes-agent/acp_registry"
    }
  ]
}
```

### Zed

示例设置片段：

```json
{
  "agent_servers": {
    "hermes-agent": {
      "type": "custom",
      "command": "hermes",
      "args": ["acp"],
    },
  },
}
```

### JetBrains

使用 ACP 兼容插件并将其指向：

```text
/path/to/hermes-agent/acp_registry
```

## 注册表清单

ACP 注册表清单住在：

```text
acp_registry/agent.json
```

它公告一个命令基 Agent 其启动命令为：

```text
hermes acp
```

## 配置和凭证

ACP 模式使用与 CLI 相同的 Hermes 配置：

- `~/.hermes/.env`
- `~/.hermes/config.yaml`
- `~/.hermes/skills/`
- `~/.hermes/state.db`

提供商解析使用 Hermes 的正常运行时解析器，所以 ACP 继承当前配置的提供商和凭证。

## 会话行为

ACP 会话由 ACP 适配器的内存会话管理器在服务器运行时跟踪。

每个会话存储：

- 会话 ID
- 工作目录
- 选定的模型
- 当前对话历史
- 取消事件

基础 `AIAgent` 仍然使用 Hermes 的正常持久化/记录路径，但 ACP `list/load/resume/fork` 限于当前运行的 ACP 服务器进程。

## 工作目录行为

ACP 会话将编辑器的 cwd 绑定到 Hermes 任务 ID 使文件和终端工具相对于编辑器工作区运行，而不是服务器进程 cwd。

## 批准

危险终端命令可以路由回编辑器作为批准提示。ACP 批准选项比 CLI 流更简单：

- 允许一次
- 总是允许
- 拒绝

超时或错误时，批准桥拒绝请求。

## 故障排除

### ACP Agent 不出现在编辑器中

检查：

- 编辑器指向正确的 `acp_registry/` 路径
- Hermes 已安装并在 PATH 中
- ACP 扩展已安装 (`pip install -e '.[acp]'`)

### ACP 启动但立即出错

尝试这些检查：

```bash
hermes doctor
hermes status
hermes acp
```

### 缺少凭证

ACP 模式没有自己的登录流。它使用 Hermes 的现有提供商设置。使用以下配置凭证：

```bash
hermes model
```

或通过编辑 `~/.hermes/.env`。

## 另请参见

- [ACP Internals](../../developer-guide/acp-internals.md)
- [Provider Runtime Resolution](../../developer-guide/provider-runtime.md)
- [Tools Runtime](../../developer-guide/tools-runtime.md)
