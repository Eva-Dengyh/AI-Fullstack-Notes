---
sidebar_position: 1
title: "快速开始"
description: "你与 Hermes Agent 的第一次对话 — 从安装到 2 分钟内开始聊天"
---

# 快速开始

本指南引导你完成安装 Hermes Agent、设置提供商和进行首次对话。到最后，你会了解主要功能以及如何进一步探索。

## 1. 安装 Hermes Agent

运行单行安装程序：

```bash
# Linux / macOS / WSL2 / Android (Termux)
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

:::tip Android / Termux
如果你在手机上安装，请查看专用的 [Termux 指南](./termux.md)，了解经过测试的手动路径、支持的扩展和当前的 Android 特定限制。
:::

:::tip Windows 用户
先安装 [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)，然后在你的 WSL2 终端中运行上述命令。
:::

完成后，重新加载你的 shell：

```bash
source ~/.bashrc   # 或 source ~/.zshrc
```

## 2. 设置提供商

安装程序自动配置你的 LLM 提供商。要稍后更改，请使用以下命令之一：

```bash
hermes model       # 选择你的 LLM 提供商和模型
hermes tools       # 配置启用哪些工具
hermes setup       # 或配置所有内容
```

`hermes model` 引导你选择推理提供商：

| 提供商 | 是什么 | 如何设置 |
|----------|-----------|---------------|
| **Nous Portal** | 基于订阅、零配置 | 通过 `hermes model` 的 OAuth 登录 |
| **OpenAI Codex** | ChatGPT OAuth，使用 Codex 模型 | 通过 `hermes model` 的设备代码认证 |
| **Anthropic** | Claude 模型直接（Pro/Max 或 API 密钥） | `hermes model` 与 Claude Code 认证，或 Anthropic API 密钥 |
| **OpenRouter** | 跨许多模型的多提供商路由 | 输入你的 API 密钥 |
| **Z.AI** | GLM / Zhipu 托管模型 | 设置 `GLM_API_KEY` / `ZAI_API_KEY` |
| **Kimi / Moonshot** | Moonshot 托管的编码和聊天模型 | 设置 `KIMI_API_KEY` |
| **MiniMax** | 国际 MiniMax 端点 | 设置 `MINIMAX_API_KEY` |
| **MiniMax China** | 中国区域 MiniMax 端点 | 设置 `MINIMAX_CN_API_KEY` |
| **Alibaba Cloud** | Qwen 模型通过 DashScope | 设置 `DASHSCOPE_API_KEY` |
| **Hugging Face** | 20+ 开源模型通过统一路由器（Qwen、DeepSeek、Kimi 等） | 设置 `HF_TOKEN` |
| **Kilo Code** | KiloCode 托管模型 | 设置 `KILOCODE_API_KEY` |
| **OpenCode Zen** | 按使用量付费访问精选模型 | 设置 `OPENCODE_ZEN_API_KEY` |
| **OpenCode Go** | $10/月订阅开源模型 | 设置 `OPENCODE_GO_API_KEY` |
| **DeepSeek** | 直接 DeepSeek API 访问 | 设置 `DEEPSEEK_API_KEY` |
| **GitHub Copilot** | GitHub Copilot 订阅（GPT-5.x、Claude、Gemini 等） | 通过 `hermes model` 的 OAuth，或 `COPILOT_GITHUB_TOKEN` / `GH_TOKEN` |
| **GitHub Copilot ACP** | Copilot ACP agent 后端（生成本地 `copilot` CLI） | `hermes model`（需要 `copilot` CLI + `copilot login`） |
| **Vercel AI Gateway** | Vercel AI Gateway 路由 | 设置 `AI_GATEWAY_API_KEY` |
| **Custom Endpoint** | VLLM、SGLang、Ollama 或任何 OpenAI 兼容 API | 设置基础 URL + API 密钥 |

:::caution 最小上下文：64K 令牌
Hermes Agent 需要至少 **64,000 令牌** 上下文的模型。上下文较小的模型无法维持多步工具调用工作流的足够工作记忆，将在启动时被拒绝。大多数托管模型（Claude、GPT、Gemini、Qwen、DeepSeek）都容易满足这一要求。如果你运行本地模型，将其上下文大小设置为至少 64K（例如 llama.cpp 的 `--ctx-size 65536` 或 Ollama 的 `-c 65536`）。
:::

:::tip
你可以随时使用 `hermes model` 切换提供商 — 无需代码更改，无需锁定。配置自定义端点时，Hermes 会提示输入上下文窗口大小并在可能时自动检测。有关详情，请参见 [Context Length Detection](../integrations/providers.md#context-length-detection)。
:::

## 3. 开始对话

```bash
hermes
```

就这么简单！你会看到一个欢迎横幅，显示你的模型、可用工具和技能。输入一条消息并按 Enter。

```
❯ What can you help me with?
```

Agent 可以访问网页搜索、文件操作、终端命令等工具 — 开箱即用。

## 4. 尝试关键功能

### 要求它使用终端

```
❯ What's my disk usage? Show the top 5 largest directories.
```

Agent 会代表你运行终端命令并显示结果。

### 使用斜杠命令

输入 `/` 查看所有命令的自动完成下拉菜单：

| 命令 | 作用 |
|---------|-------------|
| `/help` | 显示所有可用命令 |
| `/tools` | 列出可用工具 |
| `/model` | 交互式切换模型 |
| `/personality pirate` | 尝试一个有趣的个性 |
| `/save` | 保存对话 |

### 多行输入

按 `Alt+Enter` 或 `Ctrl+J` 添加新行。非常适合粘贴代码或编写详细提示。

### 中断 Agent

如果 Agent 花费太长时间，只需输入新消息并按 Enter — 它会中断当前任务并切换到你的新指令。`Ctrl+C` 也有效。

### 恢复会话

退出时，hermes 打印一个恢复命令：

```bash
hermes --continue    # 恢复最近的会话
hermes -c            # 简写形式
```

## 5. 进一步探索

以下是接下来要尝试的一些事项：

### 设置沙箱终端

为了安全起见，在 Docker 容器或远程服务器中运行 Agent：

```bash
hermes config set terminal.backend docker    # Docker 隔离
hermes config set terminal.backend ssh       # 远程服务器
```

### 连接消息平台

通过 Telegram、Discord、Slack、WhatsApp、Signal、Email 或 Home Assistant 从你的手机或其他表面与 Hermes 对话：

```bash
hermes gateway setup    # 交互式平台配置
```

### 添加语音模式

想要在 CLI 中进行麦克风输入或在消息中获得语音回复吗？

```bash
pip install "hermes-agent[voice]"

# 可选但推荐用于免费本地语音转文本
pip install faster-whisper
```

然后启动 Hermes 并在 CLI 内启用它：

```text
/voice on
```

在 CLI、Telegram、Discord 和 Discord 语音频道中按 `Ctrl+B` 录音，或使用 `/voice tts` 让 Hermes 说出其回复。有关完整设置，请参见 [Voice Mode](../user-guide/features/voice-mode.md)。

### 安排自动化任务

```
❯ Every morning at 9am, check Hacker News for AI news and send me a summary on Telegram.
```

Agent 会设置一个通过网关自动运行的 cron 作业。

### 浏览和安装技能

```bash
hermes skills search kubernetes
hermes skills search react --source skills-sh
hermes skills search https://mintlify.com/docs --source well-known
hermes skills install openai/skills/k8s
hermes skills install official/security/1password
hermes skills install skills-sh/vercel-labs/json-render/json-render-react --force
```

提示：
- 使用 `--source skills-sh` 搜索公共 `skills.sh` 目录。
- 使用 `--source well-known` 与 docs/site URL 从 `/.well-known/skills/index.json` 发现技能。
- 仅在审查第三方技能后使用 `--force`。它可以覆盖非危险政策块，但不能覆盖 `dangerous` 扫描结果。

或在聊天内使用 `/skills` 斜杠命令。

### 通过 ACP 在编辑器中使用 Hermes

Hermes 也可以作为 ACP 服务器运行，适用于 VS Code、Zed 和 JetBrains 等 ACP 兼容编辑器：

```bash
pip install -e '.[acp]'
hermes acp
```

有关设置详情，请参见 [ACP Editor Integration](../user-guide/features/acp.md)。

### 尝试 MCP 服务器

通过模型上下文协议连接到外部工具：

```yaml
# 添加到 ~/.hermes/config.yaml
mcp_servers:
  github:
    command: npx
    args: ["-y", "@modelcontextprotocol/server-github"]
    env:
      GITHUB_PERSONAL_ACCESS_TOKEN: "ghp_xxx"
```

---

## 快速参考

| 命令 | 描述 |
|---------|-------------|
| `hermes` | 开始对话 |
| `hermes model` | 选择你的 LLM 提供商和模型 |
| `hermes tools` | 配置每个平台启用哪些工具 |
| `hermes setup` | 完整设置向导（一次配置所有内容） |
| `hermes doctor` | 诊断问题 |
| `hermes update` | 更新至最新版本 |
| `hermes gateway` | 启动消息网关 |
| `hermes --continue` | 恢复上一个会话 |

## 后续步骤

- **[CLI 指南](../user-guide/cli.md)** — 掌握终端界面
- **[配置](../user-guide/configuration.md)** — 自定义你的设置
- **[消息网关](../user-guide/messaging/index.md)** — 连接 Telegram、Discord、Slack、WhatsApp、Signal、Email 或 Home Assistant
- **[工具和工具集](../user-guide/features/tools.md)** — 探索可用功能
