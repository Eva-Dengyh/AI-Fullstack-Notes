---
title: "在 Mac 上运行本地 LLM"
description: "在 macOS 上使用 llama.cpp 或 MLX 搭建兼容 OpenAI 的本地 LLM 服务，包括模型选择、内存优化，以及 Apple Silicon 上的真实基准"
---

# 在 Mac 上运行本地 LLM

这篇指南会带你在 macOS 上搭建一个兼容 OpenAI API 的本地 LLM 服务。你可以获得完整隐私、零 API 成本，以及在 Apple Silicon 上相当不错的性能。

本文会介绍两种后端：

| Backend | 安装方式 | 最擅长 | 格式 |
|---------|---------|---------|--------|
| **llama.cpp** | `brew install llama.cpp` | 首 token 延迟最低，支持量化 KV cache，适合低内存机器 | GGUF |
| **omlx** | [omlx.ai](https://omlx.ai) | 生成速度最快，原生 Metal 优化 | MLX (safetensors) |

两者都会暴露兼容 OpenAI 的 `/v1/chat/completions` 接口。Hermes 可以直接接入任意一种，只需要把地址指向 `http://localhost:8080` 或 `http://localhost:8000`。

:::info 仅适用于 Apple Silicon
这篇指南主要面向搭载 Apple Silicon（M1 及之后）的 Mac。Intel Mac 也能运行 llama.cpp，但没有 GPU 加速，性能会慢很多。
:::

---

## 选择模型

如果你刚开始上手，推荐 **Qwen3.5-9B**。这是一个推理能力很强的模型，在量化后可以相对轻松地装进 8GB 以上统一内存的机器里。

| 变体 | 磁盘大小 | 所需内存（128K 上下文） | Backend |
|---------|-------------|---------------------------|---------|
| Qwen3.5-9B-Q4_K_M (GGUF) | 5.3 GB | 使用量化 KV cache 时约 10 GB | llama.cpp |
| Qwen3.5-9B-mlx-lm-mxfp4 (MLX) | 约 5 GB | 约 12 GB | omlx |

**内存估算经验法则：** 模型大小 + KV cache。9B Q4 模型大约 5 GB。若上下文是 128K，并启用 Q4 量化 KV cache，还要再加约 4 到 5 GB；如果使用默认的 f16 KV cache，就会膨胀到大约 16 GB。对于内存紧张的机器来说，llama.cpp 的量化 KV cache 开关是最关键的技巧。

如果你想跑更大的模型（27B、35B），通常需要 32 GB 以上统一内存。对于 8 到 16 GB 机器来说，9B 往往是最佳平衡点。

---

## 方案 A：llama.cpp

llama.cpp 是最通用、移植性最好的本地 LLM 运行时。在 macOS 上，它开箱即用 Metal 做 GPU 加速。

### 安装

```bash
brew install llama.cpp
```

安装后你会拿到全局可用的 `llama-server` 命令。

### 下载模型

你需要一个 GGUF 格式的模型。最方便的来源通常是通过 `huggingface-cli` 从 Hugging Face 下载：

```bash
brew install huggingface-cli
```

然后执行：

```bash
huggingface-cli download unsloth/Qwen3.5-9B-GGUF Qwen3.5-9B-Q4_K_M.gguf --local-dir ~/models
```

:::tip 受限模型
Hugging Face 上有些模型需要登录授权。如果你遇到 401 或 404，先运行 `huggingface-cli login`。
:::

### 启动服务

```bash
llama-server -m ~/models/Qwen3.5-9B-Q4_K_M.gguf \
  -ngl 99 \
  -c 131072 \
  -np 1 \
  -fa on \
  --cache-type-k q4_0 \
  --cache-type-v q4_0 \
  --host 0.0.0.0
```

各参数含义如下：

| 参数 | 作用 |
|------|---------|
| `-ngl 99` | 尽可能把所有层都卸载到 GPU（Metal）上，设置一个很大的值可以避免残留在 CPU。 |
| `-c 131072` | 上下文窗口大小（128K token）。如果内存不够，可以优先减小它。 |
| `-np 1` | 并行 slot 数。单用户使用建议设为 1，多 slot 会拆分你的内存预算。 |
| `-fa on` | 开启 Flash Attention。能减少内存占用，并加速长上下文推理。 |
| `--cache-type-k q4_0` | 把 key cache 量化为 4-bit。**这是最关键的省内存选项之一。** |
| `--cache-type-v q4_0` | 把 value cache 量化为 4-bit。与上面配合，KV cache 内存可比 f16 降低约 75%。 |
| `--host 0.0.0.0` | 监听所有网卡。若只供本机使用，可换成 `127.0.0.1`。 |

当你看到下面的输出时，说明服务已经可用：

```
main: server is listening on http://0.0.0.0:8080
srv  update_slots: all slots are idle
```

### 面向低内存机器的优化

对内存受限的设备来说，`--cache-type-k q4_0 --cache-type-v q4_0` 是最重要的优化手段。128K 上下文下，大致影响如下：

| KV cache 类型 | KV cache 内存占用（128K，上 9B 模型） |
|---------------|--------------------------------------|
| f16（默认） | 约 16 GB |
| q8_0 | 约 8 GB |
| **q4_0** | **约 4 GB** |

在 8 GB Mac 上，建议使用 `q4_0` KV cache，并把上下文缩到 `-c 32768`（32K）。16 GB 机器则通常可以较舒服地跑 128K。32 GB 以上则可以考虑更大的模型或多个并行 slot。

如果还是爆内存，优先先减小上下文长度（`-c`），然后再考虑用更小的量化版本，比如从 Q4_K_M 换成 Q3_K_M。

### 测试

```bash
curl -s http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.5-9B-Q4_K_M.gguf",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }' | jq .choices[0].message.content
```

### 获取模型名

如果你忘了服务端识别的模型名，可以查 models 接口：

```bash
curl -s http://localhost:8080/v1/models | jq '.data[].id'
```

---

## 方案 B：通过 omlx 使用 MLX

[omlx](https://omlx.ai) 是一个 macOS 原生应用，用来管理和提供 MLX 模型服务。MLX 是 Apple 自家的机器学习框架，专门针对 Apple Silicon 的统一内存架构优化。

### 安装

从 [omlx.ai](https://omlx.ai) 下载并安装。它提供模型管理界面和内置服务端。

### 下载模型

在 omlx 应用中浏览模型并下载即可。搜索 `Qwen3.5-9B-mlx-lm-mxfp4`，下载后模型会保存在本地（通常位于 `~/.omlx/models/`）。

### 启动服务

omlx 默认会在 `http://127.0.0.1:8000` 提供模型服务。你可以通过图形界面启动，也可以使用其 CLI（若可用）。

### 测试

```bash
curl -s http://127.0.0.1:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Qwen3.5-9B-mlx-lm-mxfp4",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": 50
  }' | jq .choices[0].message.content
```

### 列出可用模型

omlx 可以同时提供多个模型：

```bash
curl -s http://127.0.0.1:8000/v1/models | jq '.data[].id'
```

---

## 基准测试：llama.cpp vs MLX

两种后端都在同一台机器上测试（Apple M5 Max，128 GB 统一内存），使用同一模型（Qwen3.5-9B），并选用大体可比的量化等级（GGUF 的 Q4_K_M，对比 MLX 的 mxfp4）。一共使用 5 组不同提示词，每组跑 3 次，按顺序测试后端，避免资源争用。

### 结果

| 指标 | llama.cpp (Q4_K_M) | MLX (mxfp4) | 胜出者 |
|--------|-------------------|-------------|--------|
| **TTFT（平均）** | **67 ms** | 289 ms | llama.cpp（快 4.3 倍） |
| **TTFT（p50）** | **66 ms** | 286 ms | llama.cpp（快 4.3 倍） |
| **生成速度（平均）** | 70 tok/s | **96 tok/s** | MLX（快 37%） |
| **生成速度（p50）** | 70 tok/s | **96 tok/s** | MLX（快 37%） |
| **总耗时（512 token）** | 7.3s | **5.5s** | MLX（快 25%） |

### 这些结果意味着什么

- **llama.cpp** 在 prompt 处理阶段表现更强，它的 flash attention 加量化 KV cache 组合能把首 token 延迟压到大约 66ms。如果你在做对响应感知很敏感的交互式应用，例如聊天机器人或自动补全，这个优势是实打实的。

- **MLX** 在进入生成阶段后，token 生成速度大约快 37%。因此对于批处理、长文本生成，或者任何“总完成时间”比“首 token 时间”更重要的场景，MLX 往往更快完成任务。

- 两个后端都**非常稳定**，不同轮次之间波动极小，所以这些数字具有较高参考价值。

### 该选哪一个

| 使用场景 | 推荐 |
|----------|---------------|
| 交互式聊天、低延迟工具调用 | llama.cpp |
| 长文本生成、批量处理 | MLX（omlx） |
| 内存紧张（8-16 GB） | llama.cpp（量化 KV cache 优势明显） |
| 同时服务多个模型 | omlx（原生支持多模型） |
| 追求最大兼容性（包括 Linux） | llama.cpp |

---

## 连接到 Hermes

当你的本地服务跑起来后：

```bash
hermes model
```

选择 **Custom endpoint**，再按提示输入。系统会询问 base URL 和模型名，分别填你刚才配置的后端地址和模型标识即可。

---

## 超时设置

Hermes 会自动识别本地端点（localhost、局域网 IP），并放宽流式读取超时。大多数情况下不需要手动配置。

如果你仍然遇到超时问题，例如超大上下文配合慢硬件，你可以显式覆盖流式读取超时：

```bash
# In your .env — raise from the 120s default to 30 minutes
HERMES_STREAM_READ_TIMEOUT=1800
```

| 超时项 | 默认值 | 本地自动调整 | 环境变量覆盖 |
|---------|---------|----------------------|------------------|
| 流式读取（socket 级） | 120s | 自动提升到 1800s | `HERMES_STREAM_READ_TIMEOUT` |
| 流中断检测 | 180s | 完全禁用 | `HERMES_STREAM_STALE_TIMEOUT` |
| 普通 API 调用（非流式） | 1800s | 通常无需改动 | `HERMES_API_TIMEOUT` |

最容易出问题的是流式读取超时，因为它本质上是“等待下一个数据块”的 socket 级 deadline。对于大上下文本地模型来说，prefill 阶段可能好几分钟都没有任何输出。Hermes 的本地端点自动识别机制就是为了解决这个问题。
