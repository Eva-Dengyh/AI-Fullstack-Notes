---
title: "语音模式"
description: "与 Hermes Agent 进行实时语音对话 — CLI、Telegram、Discord（DM、文本频道和语音频道）"
---

# 语音模式

Hermes Agent 在 CLI 和消息平台中支持完整的语音交互。用麦克风与 Agent 对话，听到语音回复，在 Discord 语音频道中进行实时语音对话。

如果你想要带推荐配置和真实使用模式的实用设置演练，见 [Use Voice Mode with Hermes](/docs/guides/use-voice-mode-with-hermes)。

## 前置要求

在使用语音功能之前，确保你有：

1. **Hermes Agent 已安装** — `pip install hermes-agent`（见 [Installation](/docs/getting-started/installation)）
2. **已配置的 LLM 提供商** — 运行 `hermes model` 或在 `~/.hermes/.env` 中设置你偏好的提供商凭证
3. **工作的基础设置** — 运行 `hermes` 以验证 Agent 在启用语音之前响应文本

:::tip
`~/.hermes/` 目录和默认 `config.yaml` 在你首次运行 `hermes` 时自动创建。你仅需手动为 API 密钥创建 `~/.hermes/.env`。
:::

## 概览

| 功能 | 平台 | 描述 |
|---------|----------|-------------|
| **交互语音** | CLI | 按 Ctrl+B 录音，Agent 自动检测静默并响应 |
| **自动语音回复** | Telegram、Discord | Agent 发送语音音频与文本响应并行 |
| **语音频道** | Discord | Bot 加入 VC，监听用户讲话，说出回复 |

## 要求

### Python 包

```bash
# CLI 语音模式（麦克风 + 音频播放）
pip install "hermes-agent[voice]"

# Discord + Telegram 消息传递（包括语音支持的 discord.py[voice]）
pip install "hermes-agent[messaging]"

# 高级 TTS（ElevenLabs）
pip install "hermes-agent[tts-premium]"

# 本地 TTS（NeuTTS，可选）
python -m pip install -U neutts[all]

# 一次性全部
pip install "hermes-agent[all]"
```

| 扩展 | 包 | 必需用于 |
|-------|----------|----------|
| `voice` | `sounddevice`, `numpy` | CLI 语音模式 |
| `messaging` | `discord.py[voice]`, `python-telegram-bot`, `aiohttp` | Discord & Telegram 机器人 |
| `tts-premium` | `elevenlabs` | ElevenLabs TTS 提供商 |

可选本地 TTS 提供商：用 `python -m pip install -U neutts[all]` 单独安装 `neutts`。首次使用时它自动下载模型。

:::info
`discord.py[voice]` 自动安装 **PyNaCl**（用于语音加密）和 **opus 绑定**。这对 Discord 语音频道支持是必需的。
:::

### 系统依赖

```bash
# macOS
brew install portaudio ffmpeg opus
brew install espeak-ng   # 用于 NeuTTS

# Ubuntu/Debian
sudo apt install portaudio19-dev ffmpeg libopus0
sudo apt install espeak-ng   # 用于 NeuTTS
```

| 依赖 | 目的 | 必需用于 |
|-----------|---------|----------|
| **PortAudio** | 麦克风输入和音频播放 | CLI 语音模式 |
| **ffmpeg** | 音频格式转换（MP3 → Opus、PCM → WAV） | 所有平台 |
| **Opus** | Discord 语音编解码器 | Discord 语音频道 |
| **espeak-ng** | 音素后端 | 本地 NeuTTS 提供商 |

### API 密钥

添加到 `~/.hermes/.env`：

```bash
# 语音转文本 — 本地提供商不需要任何密钥
# pip install faster-whisper          # 免费、本地运行、推荐
GROQ_API_KEY=your-key                 # Groq Whisper — 快速、免费层（云）
VOICE_TOOLS_OPENAI_KEY=your-key       # OpenAI Whisper — 付费（云）

# 文本转语音（可选 — Edge TTS 和 NeuTTS 无需任何密钥）
ELEVENLABS_API_KEY=***           # ElevenLabs — 高级质量
# 上面的 VOICE_TOOLS_OPENAI_KEY 也启用 OpenAI TTS
```

:::tip
如果你使用 CLI 语音模式，最小化安装是：`pip install "hermes-agent[voice]"`加上 macOS/Linux 系统依赖。远程（SSH）会话不支持语音 I/O，因为麦克风访问需要本地硬件。
:::

## CLI 语音模式

### 交互式语音记录

```bash
hermes
❯ /voice on
```

按 `Ctrl+B` 开始录音。Agent 在检测到 2 秒静默时自动停止。

### 语音回复

```bash
❯ /voice tts
```

Agent 说出它的回复。使用 `/voice tts off` 关闭此功能。

### 配置

```yaml
# 在 ~/.hermes/config.yaml 中
voice:
  stt_provider: "groq"       # "groq" | "openai" | "local"（本地 = faster-whisper）
  tts_provider: "edge"       # "edge" | "elevenlabs" | "openai" | "mistral" | "neutts"
```

## Telegram 和 Discord 语音

### Telegram 语音消息

发送语音消息到 Hermes。Agent 自动转录并响应。

### Discord 语音频道

```bash
hermes gateway install
hermes gateway start

# 在 Discord 中：
/join #voice-channel
```

Agent 加入频道，监听用户讲话，并说出回复。

## 故障排除

### "模块 'sounddevice' 未找到"

```bash
pip install sounddevice
```

### "portaudio 未找到"

```bash
# macOS
brew install portaudio

# Ubuntu/Debian
sudo apt install portaudio19-dev
```

### 麦克风无法工作

检查系统麦克风权限：

- **macOS**：System Preferences → Security & Privacy → Microphone
- **Linux**：运行 `pactl list sources` 以列出可用设备
- **Windows/WSL**：确保 WSL 有麦克风访问
