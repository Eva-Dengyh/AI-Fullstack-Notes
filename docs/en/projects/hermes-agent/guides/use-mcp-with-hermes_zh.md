---
title: "在 Hermes 中使用 MCP"
description: "一份实战指南，讲清楚如何把 MCP 服务器接入 Hermes Agent、如何过滤工具，以及如何在真实工作流中安全使用"
---

# 在 Hermes 中使用 MCP

这篇指南讲的是，如何在日常工作流里真正把 MCP 和 Hermes Agent 用起来。

如果功能页负责解释“什么是 MCP”，那这篇文章关注的是：怎样快速、安全地从它身上获得实际价值。

## 什么时候应该用 MCP？

适合使用 MCP 的场景：
- 已经有现成的 MCP 工具，而你不想再额外开发一个 Hermes 原生工具
- 你希望 Hermes 通过清晰的 RPC 层去操作本地或远程系统
- 你希望对每个服务器暴露给模型的能力做精细控制
- 你想把 Hermes 接到公司内部 API、数据库或业务系统上，同时又不修改 Hermes 核心

不适合使用 MCP 的场景：
- Hermes 自带工具已经足够好地解决问题
- 服务器暴露了大量高风险工具，而你还没有准备好做过滤
- 你只需要一个非常窄的集成，自己写个原生工具反而更简单、更安全

## 心智模型

把 MCP 想成一层适配器：

- Hermes 仍然是 Agent 本体
- MCP 服务器负责贡献工具
- Hermes 会在启动或重新加载时发现这些工具
- 模型会像使用普通工具一样使用它们
- 你可以控制每台服务器究竟暴露多少能力

最后这一点非常关键。好的 MCP 使用方式，不是“把所有东西都接上”；而是“只接对的东西，并且暴露最小但足够有用的能力面”。

## 第 1 步：安装 MCP 支持

如果你使用的是 Hermes 标准安装脚本，那么 MCP 支持通常已经包含在内（安装脚本会执行 `uv pip install -e ".[all]"`）。

如果你最初没有安装额外依赖，需要单独补装 MCP：

```bash
cd ~/.hermes/hermes-agent
uv pip install -e ".[mcp]"
```

如果你要用基于 npm 的 MCP 服务器，请确保系统里有 Node.js 和 `npx`。

对于很多 Python 实现的 MCP 服务器来说，`uvx` 往往是一个不错的默认选择。

## 第 2 步：先只添加一个服务器

先从一台单一、可控、风险较低的服务器开始。

例如：只给某一个项目目录开放文件系统访问。

```yaml
mcp_servers:
  project_fs:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/my-project"]
```

然后启动 Hermes：

```bash
hermes chat
```

接着问一个明确的问题：

```text
Inspect this project and summarize the repo layout.
```

## 第 3 步：确认 MCP 已成功加载

你可以从几种方式判断 MCP 是否正常工作：

- Hermes 的启动横幅或状态信息中应显示 MCP 集成已启用
- 直接问 Hermes 当前有哪些工具可用
- 修改配置后执行 `/reload-mcp`
- 如果连接失败，查看日志

一个很实用的测试提示词：

```text
Tell me which MCP-backed tools are available right now.
```

## 第 4 步：一开始就做过滤

如果某个服务器暴露了很多工具，不要等以后再过滤。

### 示例：只白名单你真正想要的工具

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, search_code]
```

对于敏感系统，这通常是最好的默认策略。

### 示例：黑名单掉危险操作

```yaml
mcp_servers:
  stripe:
    url: "https://mcp.stripe.com"
    headers:
      Authorization: "Bearer ***"
    tools:
      exclude: [delete_customer, refund_payment]
```

### 示例：顺便禁用资源和 prompt 包装器

```yaml
mcp_servers:
  docs:
    url: "https://mcp.docs.example.com"
    tools:
      prompts: false
      resources: false
```

## 过滤到底影响什么

Hermes 中 MCP 暴露出来的能力分成两类：

1. MCP 服务器原生提供的工具
- 通过以下配置过滤：
  - `tools.include`
  - `tools.exclude`

2. Hermes 额外包装出来的辅助工具
- 通过以下配置控制：
  - `tools.resources`
  - `tools.prompts`

### 你可能会看到的辅助包装器

Resources：
- `list_resources`
- `read_resource`

Prompts：
- `list_prompts`
- `get_prompt`

这些包装器只有在以下条件都满足时才会出现：
- 你的配置允许它们
- MCP 服务器本身确实支持对应能力

也就是说，如果服务器根本不支持 resources 或 prompts，Hermes 不会假装它有。

## 常见模式

### 模式 1：本地项目助手

当你希望 Hermes 在一个受限工作区内进行推理时，可以给它接一个仓库本地的 filesystem 或 git 服务器。

```yaml
mcp_servers:
  fs:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"]

  git:
    command: "uvx"
    args: ["mcp-server-git", "--repository", "/home/user/project"]
```

合适的提示词例如：

```text
Review the project structure and identify where configuration lives.
```

```text
Check the local git state and summarize what changed recently.
```

### 模式 2：GitHub 分诊助手

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, update_issue, search_code]
      prompts: false
      resources: false
```

适合的提示词例如：

```text
List open issues about MCP, cluster them by theme, and draft a high-quality issue for the most common bug.
```

```text
Search the repo for uses of _discover_and_register_server and explain how MCP tools are registered.
```

### 模式 3：内部 API 助手

```yaml
mcp_servers:
  internal_api:
    url: "https://mcp.internal.example.com"
    headers:
      Authorization: "Bearer ***"
    tools:
      include: [list_customers, get_customer, list_invoices]
      resources: false
      prompts: false
```

提示词示例：

```text
Look up customer ACME Corp and summarize recent invoice activity.
```

这种场景下，严格白名单通常远好于黑名单。

### 模式 4：文档 / 知识服务器

有些 MCP 服务器暴露的是 prompt 或资源，更像共享知识资产，而不是直接动作。

```yaml
mcp_servers:
  docs:
    url: "https://mcp.docs.example.com"
    tools:
      prompts: true
      resources: true
```

提示词示例：

```text
List available MCP resources from the docs server, then read the onboarding guide and summarize it.
```

```text
List prompts exposed by the docs server and tell me which ones would help with incident response.
```

## 一套端到端的推荐流程

下面是一种很实用的推进方式。

### 阶段 1：先用很小的白名单接 GitHub MCP

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, search_code]
      prompts: false
      resources: false
```

启动 Hermes 后，先试试：

```text
Search the codebase for references to MCP and summarize the main integration points.
```

### 阶段 2：只有在需要时才扩大权限

如果后来你确实需要更新 issue，再把能力面扩展一点：

```yaml
tools:
  include: [list_issues, create_issue, update_issue, search_code]
```

然后重新加载：

```text
/reload-mcp
```

### 阶段 3：再加第二台服务器，并给它不同策略

```yaml
mcp_servers:
  github:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "***"
    tools:
      include: [list_issues, create_issue, update_issue, search_code]
      prompts: false
      resources: false

  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/project"]
```

这时 Hermes 就能把多套系统串起来：

```text
Inspect the local project files, then create a GitHub issue summarizing the bug you find.
```

这正是 MCP 强大的地方：不需要改 Hermes 核心，就能实现跨系统工作流。

## 安全使用建议

### 对危险系统优先使用 allowlist

对于金融系统、面向客户的系统或具备破坏性操作的系统：
- 优先使用 `tools.include`
- 一开始只开放最小可用能力

### 不用的辅助能力就关掉

如果你不希望模型浏览服务器提供的资源或 prompts，就明确关闭：

```yaml
tools:
  resources: false
  prompts: false
```

### 让服务器作用范围足够小

例如：
- 文件系统服务器只允许访问某个项目目录，而不是整个 home 目录
- git 服务器只指向单个仓库
- 内部 API 默认只暴露读取型工具

### 配置改完记得重载

```text
/reload-mcp
```

当你修改了这些内容后，都应该重载：
- include / exclude 列表
- enabled 开关
- resources / prompts 开关
- 认证头或环境变量

## 按症状排障

### “服务器连上了，但我预期的工具没出现”

可能原因：
- 被 `tools.include` 过滤掉了
- 被 `tools.exclude` 排除了
- 包装器被 `resources: false` 或 `prompts: false` 关闭了
- 服务器本身其实不支持 resources 或 prompts

### “配置写了，但什么都没加载”

检查：
- 配置里是不是无意中留下了 `enabled: false`
- 命令或运行时是否存在（例如 `npx`、`uvx`）
- HTTP 端点是否可达
- 环境变量或认证头是否正确

### “为什么看到的工具比 MCP 服务器宣称的少？”

因为 Hermes 现在会严格遵守你针对每台服务器配置的策略，也会根据实际能力进行注册。这是正常现象，而且通常正是你想要的。

### “不删配置，怎么临时停用一个 MCP 服务器？”

使用：

```yaml
enabled: false
```

这样配置还保留着，但 Hermes 不会去连接和注册它。

## 推荐的第一批 MCP 服务器

对大多数用户来说，最适合先接入的服务器有：
- filesystem
- git
- GitHub
- fetch / 文档类 MCP 服务器
- 一个能力边界明确的内部 API

不适合作为起点的通常是：
- 业务面很大、破坏性操作很多、又没有做过滤的大型业务系统
- 你自己都还没完全搞清楚边界和风险的系统

## 相关文档

- [MCP (Model Context Protocol)](/docs/user-guide/features/mcp)
- [FAQ](/docs/reference/faq)
- [Slash Commands](/docs/reference/slash-commands)
