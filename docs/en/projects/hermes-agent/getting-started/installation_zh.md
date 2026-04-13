---
sidebar_position: 2
title: "安装"
description: "在 Linux、macOS、WSL2 或通过 Termux 在 Android 上安装 Hermes Agent"
---

# 安装

两分钟内快速启动 Hermes Agent，使用单行安装程序，或按照手动步骤获得完全控制。

## 快速安装

### Linux / macOS / WSL2

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Android / Termux

Hermes 现在提供了一个 Termux 感知的安装程序路径：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

安装程序自动检测 Termux 并切换到经过测试的 Android 流程：
- 使用 Termux `pkg` 安装系统依赖（`git`、`python`、`nodejs`、`ripgrep`、`ffmpeg`、构建工具）
- 使用 `python -m venv` 创建虚拟环境
- 自动导出 `ANDROID_API_LEVEL` 用于 Android wheel 构建
- 使用 `pip` 安装精心挑选的 `.[termux]` 扩展
- 默认跳过未测试的浏览器 / WhatsApp 引导

如果你想要完整的显式路径，请参照专用的 [Termux 指南](./termux.md)。

:::warning Windows
原生 Windows **不支持**。请安装 [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) 并从 WSL2 中运行 Hermes Agent。上面的安装命令在 WSL2 中有效。
:::

### 安装程序的作用

安装程序自动处理一切 — 所有依赖（Python、Node.js、ripgrep、ffmpeg）、仓库克隆、虚拟环境、全局 `hermes` 命令设置和 LLM 提供商配置。到最后，你已准备好对话。

### 安装后

重新加载你的 shell 并开始对话：

```bash
source ~/.bashrc   # 或: source ~/.zshrc
hermes             # 开始对话！
```

要稍后重新配置单个设置，请使用专用命令：

```bash
hermes model          # 选择你的 LLM 提供商和模型
hermes tools          # 配置启用哪些工具
hermes gateway setup  # 设置消息平台
hermes config set     # 设置单个配置值
hermes setup          # 或运行完整设置向导以配置所有内容
```

---

## 前置要求

唯一的前置要求是 **Git**。安装程序自动处理其他一切：

- **uv**（快速 Python 包管理器）
- **Python 3.11**（通过 uv，无需 sudo）
- **Node.js v22**（用于浏览器自动化和 WhatsApp 桥接）
- **ripgrep**（快速文件搜索）
- **ffmpeg**（用于 TTS 的音频格式转换）

:::info
你**不需要**手动安装 Python、Node.js、ripgrep 或 ffmpeg。安装程序检测缺失的内容并为你安装。只需确保 `git` 可用（`git --version`）。
:::

:::tip Nix 用户
如果你使用 Nix（在 NixOS、macOS 或 Linux 上），有一条专用的设置路径，包括 Nix flake、声明式 NixOS 模块和可选容器模式。请参阅 **[Nix & NixOS 设置](./nix-setup.md)** 指南。
:::

---

## 手动安装

如果你希望对安装过程有完全控制，请按照以下步骤操作。

### Step 1：克隆仓库

使用 `--recurse-submodules` 克隆以拉取所需的子模块：

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
```

如果你已经克隆但没有 `--recurse-submodules`：
```bash
git submodule update --init --recursive
```

### Step 2：安装 uv 并创建虚拟环境

```bash
# 安装 uv（如果尚未安装）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 使用 Python 3.11 创建 venv（uv 会在需要时下载 — 无需 sudo）
uv venv venv --python 3.11
```

:::tip
你**不需要**激活 venv 来使用 `hermes`。入口点有一个硬编码的 shebang 指向 venv Python，所以一旦链接后它在全局工作。
:::

### Step 3：安装 Python 依赖

```bash
# 告诉 uv 要安装到哪个 venv
export VIRTUAL_ENV="$(pwd)/venv"

# 使用所有扩展安装
uv pip install -e ".[all]"
```

如果你只想要核心 agent（无 Telegram/Discord/cron 支持）：
```bash
uv pip install -e "."
```

<details>
<summary><strong>可选扩展分解</strong></summary>

| 扩展 | 作用 | 安装命令 |
|-------|-------------|-----------------|
| `all` | 下面的所有内容 | `uv pip install -e ".[all]"` |
| `messaging` | Telegram & Discord 网关 | `uv pip install -e ".[messaging]"` |
| `cron` | 用于定时任务的 cron 表达式解析 | `uv pip install -e ".[cron]"` |
| `cli` | 设置向导的终端菜单 UI | `uv pip install -e ".[cli]"` |
| `modal` | Modal 云执行后端 | `uv pip install -e ".[modal]"` |
| `tts-premium` | ElevenLabs 高级语音 | `uv pip install -e ".[tts-premium]"` |
| `voice` | CLI 麦克风输入 + 音频播放 | `uv pip install -e ".[voice]"` |
| `pty` | PTY 终端支持 | `uv pip install -e ".[pty]"` |
| `termux` | 经过测试的 Android / Termux 包 (`cron`、`cli`、`pty`、`mcp`、`honcho`、`acp`) | `python -m pip install -e ".[termux]" -c constraints-termux.txt` |
| `honcho` | AI 原生内存（Honcho 集成） | `uv pip install -e ".[honcho]"` |
| `mcp` | 模型上下文协议支持 | `uv pip install -e ".[mcp]"` |
| `homeassistant` | Home Assistant 集成 | `uv pip install -e ".[homeassistant]"` |
| `acp` | ACP 编辑器集成支持 | `uv pip install -e ".[acp]"` |
| `slack` | Slack 消息 | `uv pip install -e ".[slack]"` |
| `dev` | pytest & 测试工具 | `uv pip install -e ".[dev]"` |

你可以组合扩展：`uv pip install -e ".[messaging,cron]"`

:::tip Termux 用户
`.[all]` 目前在 Android 上不可用，因为 `voice` 扩展拉取 `faster-whisper`，它依赖于 `ctranslate2` wheels，这些 wheels 不是为 Android 发布的。使用 `.[termux]` 获得经过测试的移动安装路径，然后仅根据需要添加单个扩展。
:::

</details>

### Step 4：安装可选子模块（如需要）

```bash
# RL 训练后端（可选）
uv pip install -e "./tinker-atropos"
```

两者都是可选的 — 如果你跳过它们，对应的工具集将不可用。

### Step 5：安装 Node.js 依赖（可选）

仅对**浏览器自动化**（由 Browserbase 驱动）和 **WhatsApp 桥接**需要：

```bash
npm install
```

### Step 6：创建配置目录

```bash
# 创建目录结构
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills,pairing,hooks,image_cache,audio_cache,whatsapp/session}

# 复制示例配置文件
cp cli-config.yaml.example ~/.hermes/config.yaml

# 创建一个空的 .env 文件用于 API 密钥
touch ~/.hermes/.env
```

### Step 7：添加你的 API 密钥

打开 `~/.hermes/.env` 并至少添加一个 LLM 提供商密钥：

```bash
# 必需 — 至少一个 LLM 提供商：
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 可选 — 启用其他工具：
FIRECRAWL_API_KEY=fc-your-key          # 网页搜索和爬虫（或自托管，见文档）
FAL_KEY=your-fal-key                   # 图像生成（FLUX）
```

或通过 CLI 设置：
```bash
hermes config set OPENROUTER_API_KEY sk-or-v1-your-key-here
```

### Step 8：将 `hermes` 添加到你的 PATH

```bash
mkdir -p ~/.local/bin
ln -sf "$(pwd)/venv/bin/hermes" ~/.local/bin/hermes
```

如果 `~/.local/bin` 不在你的 PATH 中，将其添加到你的 shell 配置：

```bash
# Bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

# Zsh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc

# Fish
fish_add_path $HOME/.local/bin
```

### Step 9：配置你的提供商

```bash
hermes model       # 选择你的 LLM 提供商和模型
```

### Step 10：验证安装

```bash
hermes version    # 检查命令是否可用
hermes doctor     # 运行诊断以验证一切正常
hermes status     # 检查你的配置
hermes chat -q "Hello! What tools do you have available?"
```

---

## 快速参考：手动安装（浓缩版）

对于只想要命令的人：

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 克隆并进入
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent

# 使用 Python 3.11 创建 venv
uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"

# 安装一切
uv pip install -e ".[all]"
uv pip install -e "./tinker-atropos"
npm install  # 可选，用于浏览器工具和 WhatsApp

# 配置
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills,pairing,hooks,image_cache,audio_cache,whatsapp/session}
cp cli-config.yaml.example ~/.hermes/config.yaml
touch ~/.hermes/.env
echo 'OPENROUTER_API_KEY=sk-or-v1-your-key' >> ~/.hermes/.env

# 使 hermes 在全局可用
mkdir -p ~/.local/bin
ln -sf "$(pwd)/venv/bin/hermes" ~/.local/bin/hermes

# 验证
hermes doctor
hermes
```

---

## 故障排除

| 问题 | 解决方案 |
|---------|----------|
| `hermes: command not found` | 重新加载你的 shell（`source ~/.bashrc`）或检查 PATH |
| `API key not set` | 运行 `hermes model` 配置你的提供商，或 `hermes config set OPENROUTER_API_KEY your_key` |
| 更新后缺少配置 | 运行 `hermes config check` 然后 `hermes config migrate` |

如需更多诊断，运行 `hermes doctor` — 它会告诉你确切缺少什么以及如何修复。
