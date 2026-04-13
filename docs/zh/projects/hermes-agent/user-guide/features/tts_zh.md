---
sidebar_position: 9
title: "语音和文本转语音"
description: "跨所有平台的文本转语音和语音消息转录"
---

# 语音和文本转语音

Hermes Agent 在所有消息平台上支持文本转语音输出和语音消息转录。

## 文本转语音

用六个提供商将文本转换为语音：

| 提供商 | 质量 | 成本 | API 密钥 |
|----------|---------|------|---------|
| **Edge TTS**（默认） | 好 | 免费 | 无需 |
| **ElevenLabs** | 优异 | 付费 | `ELEVENLABS_API_KEY` |
| **OpenAI TTS** | 好 | 付费 | `VOICE_TOOLS_OPENAI_KEY` |
| **MiniMax TTS** | 优异 | 付费 | `MINIMAX_API_KEY` |
| **Mistral（Voxtral TTS）** | 优异 | 付费 | `MISTRAL_API_KEY` |
| **NeuTTS** | 好 | 免费 | 无需 |

### 平台发送

| 平台 | 发送 | 格式 |
|----------|----------|--------|
| Telegram | 语音气泡（内联播放） | Opus `.ogg` |
| Discord | 语音气泡（Opus/OGG），回退文件附件 | Opus/MP3 |
| WhatsApp | 音频文件附件 | MP3 |
| CLI | 保存到 `~/.hermes/audio_cache/` | MP3 |

### 配置

```yaml
# 在 ~/.hermes/config.yaml 中
tts:
  provider: "edge"              # "edge" | "elevenlabs" | "openai" | "minimax" | "mistral" | "neutts"
  edge:
    voice: "en-US-AriaNeural"   # 322 种声音、74 种语言
  elevenlabs:
    voice_id: "pNInz6obpgDQGcFmaJgB"  # Adam
    model_id: "eleven_multilingual_v2"
  openai:
    model: "gpt-4o-mini-tts"
    voice: "alloy"              # alloy, echo, fable, onyx, nova, shimmer
    base_url: "https://api.openai.com/v1"  # 覆盖 OpenAI 兼容 TTS 端点
  minimax:
    model: "speech-2.8-hd"     # speech-2.8-hd（默认）, speech-2.8-turbo
    voice_id: "English_Graceful_Lady"  # 见 https://platform.minimax.io/faq/system-voice-id
    speed: 1                    # 0.5 - 2.0
    vol: 1                      # 0 - 10
    pitch: 0                    # -12 - 12
  mistral:
    model: "voxtral-mini-tts-2603"
    voice_id: "c69964a6-ab8b-4f8a-9465-ec0925096ec8"  # Paul - Neutral（默认）
  neutts:
    ref_audio: ''
    ref_text: ''
    model: neuphonic/neutts-air-q4-gguf
    device: cpu
```

### Telegram 语音气泡和 ffmpeg

Telegram 语音气泡需要 Opus/OGG 音频格式：

- **OpenAI、ElevenLabs 和 Mistral** 原生生成 Opus — 无需额外设置
- **Edge TTS**（默认）输出 MP3 并需要 **ffmpeg** 转换：
- **MiniMax TTS** 输出 MP3 并需要 **ffmpeg** 转换用于 Telegram 语音气泡
- **NeuTTS** 输出 WAV 并也需要 **ffmpeg** 转换用于 Telegram 语音气泡

```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

无 ffmpeg，Edge TTS、MiniMax TTS 和 NeuTTS 音频作为常规音频文件被发送（可播放，但显示为矩形播放器而非语音气泡）。

:::tip
如果你想要语音气泡而无需安装 ffmpeg，切换到 OpenAI、ElevenLabs 或 Mistral 提供商。
:::

## 语音消息转录（STT）

在 Telegram、Discord、WhatsApp、Slack 或 Signal 上发送的语音消息自动被转录并注入为对话中的文本。Agent 将转录看作正常文本。

| 提供商 | 质量 | 成本 | API 密钥 |
|----------|---------|------|---------|
| **本地 Whisper**（默认） | 好 | 免费 | 无需 |
| **Groq Whisper API** | 好–最佳 | 免费层 | `GROQ_API_KEY` |
| **OpenAI Whisper API** | 好–最佳 | 付费 | `VOICE_TOOLS_OPENAI_KEY` 或 `OPENAI_API_KEY` |

:::info 零配置

本地 Whisper（通过 `faster-whisper`）需要无 API 密钥的一次性安装：

```bash
pip install faster-whisper
```

首次使用时它下载模型（~4GB）。之后，转录是离线且免费的。
:::

### 配置

```yaml
# 在 ~/.hermes/config.yaml 中
stt:
  provider: "groq"        # "groq" | "openai" | "local"（本地 = faster-whisper）
  language: "en"          # ISO 639-1 语言代码
```
