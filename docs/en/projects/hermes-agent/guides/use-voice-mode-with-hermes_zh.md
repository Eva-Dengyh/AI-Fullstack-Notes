---
sidebar_position: 8
title: "在 Hermes 中使用语音模式"
description: "一份实用指南，讲解如何在 CLI、Telegram、Discord 和 Discord 语音频道中配置并使用 Hermes 语音模式"
---

# 在 Hermes 中使用语音模式

这篇指南是 [Voice Mode 功能参考](/docs/user-guide/features/voice-mode) 的实战补充。

如果功能页负责解释语音模式能做什么，那这篇文章会告诉你怎样把它真正用好。

## 语音模式适合什么

语音模式尤其适合以下场景：
- 你想在 CLI 中免手打操作
- 你希望 Telegram 或 Discord 中的回复可以朗读出来
- 你想让 Hermes 进入 Discord 语音频道，进行实时对话
- 你想在走动时快速捕捉想法、调试问题或来回讨论，而不是一直打字

## 选择你的语音模式配置

Hermes 里实际有三种不同的语音体验。

| 模式 | 最适合 | 平台 |
|---|---|---|
| 交互式麦克风循环 | 编码或研究时的个人免手打工作流 | CLI |
| 聊天中的语音回复 | 在普通消息旁边附带朗读回复 | Telegram、Discord |
| 实时语音频道机器人 | 个人或小组在语音频道中实时对话 | Discord 语音频道 |

推荐的推进路径是：
1. 先让文本模式正常工作
2. 再启用语音回复
3. 如果你想要完整体验，最后再尝试 Discord 语音频道

## 第 1 步：先确认普通 Hermes 能正常工作

在配置语音前，先确认：
- Hermes 能启动
- provider 已配置好
- Agent 能正常回答文本提示

```bash
hermes
```

问一个简单问题：

```text
What tools do you have available?
```

如果这一步还不稳定，先修文本模式，不要急着配置语音。

## 第 2 步：安装对应 extras

### CLI 麦克风和播放

```bash
pip install "hermes-agent[voice]"
```

### 消息平台

```bash
pip install "hermes-agent[messaging]"
```

### 高级 ElevenLabs TTS

```bash
pip install "hermes-agent[tts-premium]"
```

### 本地 NeuTTS（可选）

```bash
python -m pip install -U neutts[all]
```

### 全部安装

```bash
pip install "hermes-agent[all]"
```

## 第 3 步：安装系统依赖

### macOS

```bash
brew install portaudio ffmpeg opus
brew install espeak-ng
```

### Ubuntu / Debian

```bash
sudo apt install portaudio19-dev ffmpeg libopus0
sudo apt install espeak-ng
```

这些依赖的作用：
- `portaudio`：CLI 语音模式中的麦克风输入和播放
- `ffmpeg`：TTS 和消息投递中的音频转换
- `opus`：Discord 语音 codec 支持
- `espeak-ng`：NeuTTS 使用的 phonemizer 后端

## 第 4 步：选择 STT 和 TTS provider

Hermes 同时支持本地和云端语音栈。

### 最简单 / 最便宜的配置

使用本地 STT 和免费的 Edge TTS：
- STT provider：`local`
- TTS provider：`edge`

这通常是最适合起步的组合。

### 环境文件示例

添加到 `~/.hermes/.env`：

```bash
# Cloud STT options (local needs no key)
GROQ_API_KEY=***
VOICE_TOOLS_OPENAI_KEY=***

# Premium TTS (optional)
ELEVENLABS_API_KEY=***
```

### Provider 推荐

#### 语音转文字

- `local`：隐私好、零成本，默认推荐
- `groq`：云端转写速度很快
- `openai`：稳定的付费备选

#### 文字转语音

- `edge`：免费，质量足够大多数使用场景
- `neutts`：免费、本地/端侧 TTS
- `elevenlabs`：质量最好
- `openai`：质量和成本之间的中间选择
- `mistral`：多语言，原生 Opus

### 如果你使用 `hermes setup`

如果你在 setup 向导中选择 NeuTTS，Hermes 会检查 `neutts` 是否已经安装。若缺失，向导会提示 NeuTTS 需要 Python 包 `neutts` 和系统包 `espeak-ng`，并询问是否为你安装；它会先用你的平台包管理器安装 `espeak-ng`，然后运行：

```bash
python -m pip install -U neutts[all]
```

如果你跳过安装，或安装失败，向导会回退到 Edge TTS。

## 第 5 步：推荐配置

```yaml
voice:
  record_key: "ctrl+b"
  max_recording_seconds: 120
  auto_tts: false
  silence_threshold: 200
  silence_duration: 3.0

stt:
  provider: "local"
  local:
    model: "base"

tts:
  provider: "edge"
  edge:
    voice: "en-US-AriaNeural"
```

这是适合大多数人的保守默认值。

如果你想使用本地 TTS，可以把 `tts` 块换成：

```yaml
tts:
  provider: "neutts"
  neutts:
    ref_audio: ''
    ref_text: ''
    model: neuphonic/neutts-air-q4-gguf
    device: cpu
```

## 使用场景 1：CLI 语音模式

## 开启

启动 Hermes：

```bash
hermes
```

在 CLI 中输入：

```text
/voice on
```

### 录音流程

默认按键：
- `Ctrl+B`

工作流：
1. 按 `Ctrl+B`
2. 开始说话
3. 等待静音检测自动停止录音
4. Hermes 转写并回答
5. 如果开启了 TTS，它会朗读回答
6. 循环可以自动重启，从而支持连续使用

### 常用命令

```text
/voice
/voice on
/voice off
/voice tts
/voice status
```

### 适合 CLI 的工作流

#### 走到电脑前就开始调试

你可以说：

```text
I keep getting a docker permission error. Help me debug it.
```

然后继续免手打对话：
- “Read the last error again”
- “Explain the root cause in simpler terms”
- “Now give me the exact fix”

#### 研究 / 头脑风暴

语音模式很适合：
- 一边走动一边思考
- 口述还没完全成型的想法
- 让 Hermes 实时帮你整理思路

#### 无障碍 / 低打字量会话

如果打字不方便，语音模式是保持完整 Hermes 循环的最快方式之一。

## 调整 CLI 行为

### 静音阈值

如果 Hermes 开始或停止录音太敏感，可以调整：

```yaml
voice:
  silence_threshold: 250
```

阈值越高，敏感度越低。

### 静音持续时间

如果你说话中间经常停顿，可以加大：

```yaml
voice:
  silence_duration: 4.0
```

### 录音快捷键

如果 `Ctrl+B` 和你的终端或 tmux 习惯冲突：

```yaml
voice:
  record_key: "ctrl+space"
```

## 使用场景 2：Telegram 或 Discord 中的语音回复

这个模式比完整语音频道简单。

Hermes 仍然是一个普通聊天机器人，但可以把回复读出来。

### 启动 gateway

```bash
hermes gateway
```

### 开启语音回复

在 Telegram 或 Discord 中输入：

```text
/voice on
```

或者：

```text
/voice tts
```

### 模式

| 模式 | 含义 |
|---|---|
| `off` | 只输出文本 |
| `voice_only` | 只有用户发送语音消息时才朗读回复 |
| `all` | 每条回复都朗读 |

### 什么时候用哪个

- 如果你只希望对语音输入返回语音回复，用 `/voice on`
- 如果你想要一个始终开口说话的助手，用 `/voice tts`

### 适合消息平台的工作流

#### 手机上的 Telegram 助手

适合以下情况：
- 你不在电脑前
- 你想发语音便签，并收到快速朗读回复
- 你希望 Hermes 像一个随身研究或运维助手一样工作

#### Discord 私信中的语音输出

适合你想要私密互动，同时不想受到服务器频道 mention 行为影响的场景。

## 使用场景 3：Discord 语音频道

这是最高级的模式。

Hermes 会加入 Discord 语音频道，监听用户语音，转写成文本，走正常 Agent 流程，再把回复读回频道中。

## 必需的 Discord 权限

除了普通文本机器人配置外，请确认机器人拥有：
- Connect
- Speak
- 最好也启用 Use Voice Activity

同时在 Developer Portal 中开启特权 intents：
- Presence Intent
- Server Members Intent
- Message Content Intent

## 加入和离开

在机器人所在的 Discord 文本频道中输入：

```text
/voice join
/voice leave
/voice status
```

### 加入后会发生什么

- 用户在语音频道中说话
- Hermes 检测语音边界
- 转写文本会发到关联的文本频道
- Hermes 用文本和音频同时回复
- 关联文本频道就是你执行 `/voice join` 的那个频道

### Discord 语音频道最佳实践

- 严格限制 `DISCORD_ALLOWED_USERS`
- 一开始用专门的 bot/testing 频道测试
- 先确认普通文本聊天里的语音模式 STT 和 TTS 都能正常工作，再尝试 VC 模式

## 语音质量建议

### 质量最优

- STT：本地 `large-v3` 或 Groq `whisper-large-v3`
- TTS：ElevenLabs

### 速度 / 便利性最优

- STT：本地 `base` 或 Groq
- TTS：Edge

### 零成本最优

- STT：local
- TTS：Edge

## 常见失败模式

### “No audio device found”

安装 `portaudio`。

### “机器人加入了，但听不到任何东西”

检查：
- 你的 Discord 用户 ID 是否在 `DISCORD_ALLOWED_USERS` 中
- 你自己是否被静音
- 特权 intents 是否启用
- 机器人是否有 Connect/Speak 权限

### “能转写，但不说话”

检查：
- TTS provider 配置
- ElevenLabs 或 OpenAI 的 API key / quota
- Edge 转换路径所需的 `ffmpeg` 是否已安装

### “Whisper 输出乱码”

尝试：
- 更安静的环境
- 更高的 `silence_threshold`
- 换一个 STT provider 或模型
- 更短、更清晰地说话

### “私信能用，但服务器频道不能用”

这通常和 mention 策略有关。

默认情况下，在 Discord 服务器文本频道中，机器人通常需要被 `@mention` 才会响应，除非你另行配置。

## 第一周推荐配置路线

如果你想以最短路径跑通：

1. 先让文本 Hermes 正常工作
2. 安装 `hermes-agent[voice]`
3. 在 CLI 中使用 local STT + Edge TTS 测试语音模式
4. 然后在 Telegram 或 Discord 中启用 `/voice on`
5. 最后再尝试 Discord VC 模式

这个推进顺序能把排障范围控制到最小。

## 接下来读什么

- [Voice Mode feature reference](/docs/user-guide/features/voice-mode)
- [Messaging Gateway](/docs/user-guide/messaging)
- [Discord setup](/docs/user-guide/messaging/discord)
- [Telegram setup](/docs/user-guide/messaging/telegram)
- [Configuration](/docs/user-guide/configuration)
