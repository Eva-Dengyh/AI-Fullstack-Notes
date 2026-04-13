---
title: "功能概览"
sidebar_label: "概览"
sidebar_position: 1
---

# 功能概览

Hermes Agent 包含一套丰富的功能，远超基础聊天范畴。从持久记忆和文件感知的上下文，到浏览器自动化和语音对话，这些功能协同工作，使 Hermes 成为一个强大的自主助手。

## 核心功能

- **[工具和工具集](tools.md)** — 工具是扩展 Agent 功能的函数。它们被组织成逻辑工具集，可按平台启用或禁用，涵盖网页搜索、终端执行、文件编辑、记忆、委托等。
- **[技能系统](skills.md)** — 按需加载的知识文档。技能遵循渐进式披露模式以最小化令牌使用，兼容 [agentskills.io](https://agentskills.io/specification) 开放标准。
- **[持久记忆](memory.md)** — 跨会话持久的有界、精心策划的记忆。Hermes 能记住你的偏好、项目、环境和通过 `MEMORY.md` 和 `USER.md` 学到的内容。
- **[上下文文件](context-files.md)** — Hermes 自动发现并加载项目上下文文件（`.hermes.md`、`AGENTS.md`、`CLAUDE.md`、`SOUL.md`、`.cursorrules`），这些文件塑造它在你的项目中的行为方式。
- **[上下文引用](context-references.md)** — 输入 `@` 后跟引用，直接将文件、文件夹、git diff 和 URL 注入到你的消息中。Hermes 展开引用并自动附加内容。
- **[检查点](../checkpoints-and-rollback.md)** — Hermes 在进行文件更改前自动对工作目录进行快照，如果出错，你可以用 `/rollback` 回滚，安全无忧。

## 自动化

- **[定时任务（Cron）](cron.md)** — 用自然语言或 cron 表达式安排自动运行的任务。任务可以附加技能、将结果发送到任何平台，并支持暂停/恢复/编辑操作。
- **[子 Agent 委托](delegation.md)** — `delegate_task` 工具生成隔离上下文、受限工具集和独立终端会话的子 Agent 实例。支持最多 3 个并发子 Agent 进行并行工作流。
- **[代码执行](code-execution.md)** — `execute_code` 工具让 Agent 编写调用 Hermes 工具的 Python 脚本，通过沙箱 RPC 执行将多步骤工作流简化为单个 LLM 转向。
- **[事件钩子](hooks.md)** — 在关键生命周期点运行自定义代码。网关钩子处理日志、告警和 webhook；插件钩子处理工具拦截、指标和护栏。
- **[批处理](batch-processing.md)** — 跨数百或数千个提示并行运行 Hermes Agent，生成结构化 ShareGPT 格式的轨迹数据用于训练数据生成或评估。

## 媒体和网络

- **[语音模式](voice-mode.md)** — 跨 CLI 和消息平台的完整语音交互。用麦克风与 Agent 对话，听到语音回复，在 Discord 语音频道中进行实时语音对话。
- **[浏览器自动化](browser.md)** — 完整的浏览器自动化，支持多个后端：Browserbase 云、Browser Use 云、通过 CDP 的本地 Chrome，或本地 Chromium。导航网站、填写表单、提取信息。
- **[视觉和图像粘贴](vision.md)** — 多模态视觉支持。从剪贴板粘贴图像到 CLI 中，要求 Agent 使用任何视觉能力的模型来分析、描述或处理它们。
- **[图像生成](image-generation.md)** — 使用 FAL.ai 的 FLUX 2 Pro 模型从文本提示生成图像，通过 Clarity Upscaler 自动 2 倍升采样。
- **[语音和文本转语音](tts.md)** — 跨所有消息平台的文本转语音输出和语音消息转录，有五个提供商选项：Edge TTS（免费）、ElevenLabs、OpenAI TTS、MiniMax 和 NeuTTS。

## 集成

- **[MCP 集成](mcp.md)** — 通过 stdio 或 HTTP 传输连接到任何 MCP 服务器。访问来自 GitHub、数据库、文件系统和内部 API 的外部工具，无需编写原生 Hermes 工具。包括按服务器工具过滤和采样支持。
- **[提供商路由](provider-routing.md)** — 精细控制哪些 AI 提供商处理你的请求。通过排序、白名单、黑名单和优先级排序优化成本、速度或质量。
- **[回退提供商](fallback-providers.md)** — 当主要模型遇到错误时自动故障转移到备用 LLM 提供商，包括对视觉和压缩等辅助任务的独立回退。
- **[凭证池](credential-pools.md)** — 为同一提供商分配多个密钥的 API 调用。在速率限制或故障时自动轮换。
- **[内存提供商](memory-providers.md)** — 插入外部记忆后端（Honcho、OpenViking、Mem0、Hindsight、Holographic、RetainDB、ByteRover），用于跨会话用户建模和超越内置内存系统的个性化。
- **[API 服务器](api-server.md)** — 将 Hermes 暴露为 OpenAI 兼容的 HTTP 端点。连接任何使用 OpenAI 格式的前端 — Open WebUI、LobeChat、LibreChat 等。
- **[IDE 集成（ACP）](acp.md)** — 在 VS Code、Zed 和 JetBrains 等 ACP 兼容编辑器中使用 Hermes。聊天、工具活动、文件 diff 和终端命令在编辑器内渲染。
- **[RL 训练](rl-training.md)** — 从 Agent 会话生成轨迹数据用于强化学习和模型微调。

## 自定义

- **[个性和 SOUL.md](personality.md)** — 完全可定制的 Agent 个性。`SOUL.md` 是主身份文件 — 系统提示的第一行 — 你可以按会话交换内置或自定义的 `/personality` 预设。
- **[皮肤和主题](skins.md)** — 自定义 CLI 的视觉呈现：横幅颜色、加载动画面孔和动词、响应框标签、品牌文本和工具活动前缀。
- **[插件](plugins.md)** — 无需修改核心代码即可添加自定义工具、钩子和集成。三种插件类型：通用插件（工具/钩子）、内存提供商（跨会话知识）和上下文引擎（替代上下文管理）。通过统一的 `hermes plugins` 交互式 UI 管理。
