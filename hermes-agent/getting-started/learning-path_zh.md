---
sidebar_position: 3
title: '学习路径'
description: '根据你的经验级别和目标选择穿过 Hermes Agent 文档的学习路径。'
---

# 学习路径

Hermes Agent 能做很多事 — CLI 助手、Telegram/Discord 机器人、任务自动化、RL 训练等。本页帮助你根据你的经验级别和想要完成的事情确定从何处开始以及读什么。

:::tip 从这里开始
如果你还没有安装 Hermes Agent，请从 [Installation guide](/docs/getting-started/installation) 开始，然后运行 [Quickstart](/docs/getting-started/quickstart)。下面的一切都假设你有一个工作的安装。
:::

## 如何使用本页

- **知道你的级别吗？** 跳到 [By Experience Level](#by-experience-level) 表格，按照你的级别的阅读顺序。
- **有特定目标吗？** 跳到 [By Use Case](#by-use-case) 并找到匹配的场景。
- **只是浏览吗？** 查看 [Key Features](#key-features-at-a-glance) 表格，快速概览 Hermes Agent 能做什么。

## 按经验级别

| 级别 | 目标 | 推荐阅读 | 时间估计 |
|---|---|---|---|
| **初学者** | 启动并运行、进行基本对话、使用内置工具 | [Installation](/docs/getting-started/installation) → [Quickstart](/docs/getting-started/quickstart) → [CLI Usage](/docs/user-guide/cli) → [Configuration](/docs/user-guide/configuration) | ~1 小时 |
| **中级** | 设置消息机器人、使用内存、cron 作业和技能等高级功能 | [Sessions](/docs/user-guide/sessions) → [Messaging](/docs/user-guide/messaging) → [Tools](/docs/user-guide/features/tools) → [Skills](/docs/user-guide/features/skills) → [Memory](/docs/user-guide/features/memory) → [Cron](/docs/user-guide/features/cron) | ~2–3 小时 |
| **高级** | 构建自定义工具、创建技能、使用 RL 训练模型、为项目做贡献 | [Architecture](/docs/developer-guide/architecture) → [Adding Tools](/docs/developer-guide/adding-tools) → [Creating Skills](/docs/developer-guide/creating-skills) → [RL Training](/docs/user-guide/features/rl-training) → [Contributing](/docs/developer-guide/contributing) | ~4–6 小时 |

## 按用例

选择与你想做的事情匹配的场景。每个都按你应该阅读它们的顺序链接相关文档。

### "我想要一个 CLI 编码助手"

使用 Hermes Agent 作为交互式终端助手来编写、审查和运行代码。

1. [Installation](/docs/getting-started/installation)
2. [Quickstart](/docs/getting-started/quickstart)
3. [CLI Usage](/docs/user-guide/cli)
4. [Code Execution](/docs/user-guide/features/code-execution)
5. [Context Files](/docs/user-guide/features/context-files)
6. [Tips & Tricks](/docs/guides/tips)

:::tip
使用上下文文件直接将文件传入你的对话。Hermes Agent 可以读取、编辑和在你的项目中运行代码。
:::

### "我想要一个 Telegram/Discord 机器人"

在你喜欢的消息平台上部署 Hermes Agent 作为机器人。

1. [Installation](/docs/getting-started/installation)
2. [Configuration](/docs/user-guide/configuration)
3. [Messaging Overview](/docs/user-guide/messaging)
4. [Telegram Setup](/docs/user-guide/messaging/telegram)
5. [Discord Setup](/docs/user-guide/messaging/discord)
6. [Voice Mode](/docs/user-guide/features/voice-mode)
7. [Use Voice Mode with Hermes](/docs/guides/use-voice-mode-with-hermes)
8. [Security](/docs/user-guide/security)

完整项目示例请参见：
- [Daily Briefing Bot](/docs/guides/daily-briefing-bot)
- [Team Telegram Assistant](/docs/guides/team-telegram-assistant)

### "我想自动化任务"

安排定期任务、运行批处理作业或链接 Agent 动作。

1. [Quickstart](/docs/getting-started/quickstart)
2. [Cron Scheduling](/docs/user-guide/features/cron)
3. [Batch Processing](/docs/user-guide/features/batch-processing)
4. [Delegation](/docs/user-guide/features/delegation)
5. [Hooks](/docs/user-guide/features/hooks)

:::tip
Cron 作业让 Hermes Agent 按计划运行任务 — 每日摘要、定期检查、自动报告 — 无需你在场。
:::

### "我想构建自定义工具/技能"

用你自己的工具和可复用的技能包扩展 Hermes Agent。

1. [Tools Overview](/docs/user-guide/features/tools)
2. [Skills Overview](/docs/user-guide/features/skills)
3. [MCP (Model Context Protocol)](/docs/user-guide/features/mcp)
4. [Architecture](/docs/developer-guide/architecture)
5. [Adding Tools](/docs/developer-guide/adding-tools)
6. [Creating Skills](/docs/developer-guide/creating-skills)

:::tip
工具是 Agent 可以调用的单个函数。技能是工具、提示和配置的包，打包在一起。从工具开始，升级到技能。
:::

### "我想训练模型"

使用 Hermes Agent 的内置 RL 训练管道通过强化学习微调模型行为。

1. [Quickstart](/docs/getting-started/quickstart)
2. [Configuration](/docs/user-guide/configuration)
3. [RL Training](/docs/user-guide/features/rl-training)
4. [Provider Routing](/docs/user-guide/features/provider-routing)
5. [Architecture](/docs/developer-guide/architecture)

:::tip
当你已经了解 Hermes Agent 如何处理对话和工具调用的基础知识时，RL 训练效果最好。如果你是新的，先运行初学者路径。
:::

### "我想将其用作 Python 库"

以程序方式将 Hermes Agent 集成到你自己的 Python 应用程序中。

1. [Installation](/docs/getting-started/installation)
2. [Quickstart](/docs/getting-started/quickstart)
3. [Python Library Guide](/docs/guides/python-library)
4. [Architecture](/docs/developer-guide/architecture)
5. [Tools](/docs/user-guide/features/tools)
6. [Sessions](/docs/user-guide/sessions)

## 一览主要功能

不确定有什么可用的？以下是主要功能的快速目录：

| 功能 | 作用 | 链接 |
|---|---|---|
| **Tools** | Agent 可以调用的内置工具（文件 I/O、搜索、shell 等） | [Tools](/docs/user-guide/features/tools) |
| **Skills** | 添加新功能的可安装插件包 | [Skills](/docs/user-guide/features/skills) |
| **Memory** | 跨会话的持久记忆 | [Memory](/docs/user-guide/features/memory) |
| **Context Files** | 将文件和目录输入对话 | [Context Files](/docs/user-guide/features/context-files) |
| **MCP** | 通过模型上下文协议连接到外部工具服务器 | [MCP](/docs/user-guide/features/mcp) |
| **Cron** | 安排定期 Agent 任务 | [Cron](/docs/user-guide/features/cron) |
| **Delegation** | 生成子 Agent 进行平行工作 | [Delegation](/docs/user-guide/features/delegation) |
| **Code Execution** | 在沙箱环境中运行代码 | [Code Execution](/docs/user-guide/features/code-execution) |
| **Browser** | 网页浏览和爬虫 | [Browser](/docs/user-guide/features/browser) |
| **Hooks** | 事件驱动回调和中间件 | [Hooks](/docs/user-guide/features/hooks) |
| **Batch Processing** | 批量处理多个输入 | [Batch Processing](/docs/user-guide/features/batch-processing) |
| **RL Training** | 用强化学习微调模型 | [RL Training](/docs/user-guide/features/rl-training) |
| **Provider Routing** | 跨多个 LLM 提供商路由请求 | [Provider Routing](/docs/user-guide/features/provider-routing) |

## 接下来读什么

根据你现在的位置：

- **刚完成安装？** → 前往 [Quickstart](/docs/getting-started/quickstart) 运行你的首次对话。
- **完成了快速开始？** → 阅读 [CLI Usage](/docs/user-guide/cli) 和 [Configuration](/docs/user-guide/configuration) 以自定义你的设置。
- **熟悉了基础知识？** → 探索 [Tools](/docs/user-guide/features/tools)、[Skills](/docs/user-guide/features/skills) 和 [Memory](/docs/user-guide/features/memory) 以释放 Agent 的全部功能。
- **为团队设置？** → 阅读 [Security](/docs/user-guide/security) 和 [Sessions](/docs/user-guide/sessions) 以了解访问控制和对话管理。
- **准备好构建？** → 跳入 [Developer Guide](/docs/developer-guide/architecture) 以了解内部并开始贡献。
- **想要实际示例？** → 查看 [Guides](/docs/guides/tips) 部分以获得真实项目和提示。

:::tip
你不需要阅读所有内容。选择与你的目标匹配的路径，按顺序遵循链接，你会很快变得高效。你可以随时回到本页面找到下一步。
:::
