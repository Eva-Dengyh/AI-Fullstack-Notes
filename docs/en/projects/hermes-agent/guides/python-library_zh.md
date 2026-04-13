---
title: "把 Hermes 当作 Python 库使用"
description: "将 AIAgent 嵌入你自己的 Python 脚本、Web 应用或自动化流水线中，无需 CLI"
---

# 把 Hermes 当作 Python 库使用

Hermes 不只是一个 CLI 工具。你也可以直接导入 `AIAgent`，在自己的 Python 脚本、Web 应用或自动化流水线中以编程方式使用它。这篇指南会告诉你具体怎么做。

---

## 安装

直接从仓库安装 Hermes：

```bash
pip install git+https://github.com/NousResearch/hermes-agent.git
```

或者使用 [uv](https://docs.astral.sh/uv/)：

```bash
uv pip install git+https://github.com/NousResearch/hermes-agent.git
```

你也可以把它固定在 `requirements.txt` 中：

```text
hermes-agent @ git+https://github.com/NousResearch/hermes-agent.git
```

:::tip
当你把 Hermes 作为库使用时，仍然需要和 CLI 相同的环境变量。最少要设置 `OPENROUTER_API_KEY`；如果你直连某个提供商，也可以使用 `OPENAI_API_KEY` 或 `ANTHROPIC_API_KEY`。
:::

---

## 基本用法

最简单的使用方式是 `chat()`：传入一条消息，拿回一个字符串结果。

```python
from run_agent import AIAgent

agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    quiet_mode=True,
)
response = agent.chat("What is the capital of France?")
print(response)
```

`chat()` 会在内部处理完整对话循环，包括工具调用、重试等细节，最终只返回文本结果。

:::warning
当你把 Hermes 嵌入自己的程序时，务必设置 `quiet_mode=True`。否则 Agent 会输出 CLI 的转圈提示、进度信息以及其他终端内容，污染你的应用输出。
:::

---

## 完整控制会话

如果你需要更细粒度的控制，可以直接使用 `run_conversation()`。它会返回一个字典，里面包含完整响应、消息历史以及元数据：

```python
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    quiet_mode=True,
)

result = agent.run_conversation(
    user_message="Search for recent Python 3.13 features",
    task_id="my-task-1",
)

print(result["final_response"])
print(f"Messages exchanged: {len(result['messages'])}")
```

返回的字典中包含：
- **`final_response`**：Agent 最终输出的文本
- **`messages`**：完整消息历史，包括 system、user、assistant 和工具调用
- **`task_id`**：这个任务所使用的隔离标识

你还可以为某次调用传入一个自定义 system message，覆盖本轮的临时系统提示：

```python
result = agent.run_conversation(
    user_message="Explain quicksort",
    system_message="You are a computer science tutor. Use simple analogies.",
)
```

---

## 配置工具权限

可以通过 `enabled_toolsets` 或 `disabled_toolsets` 控制 Agent 能访问哪些工具集：

```python
# 只启用 web 工具（浏览、搜索）
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    enabled_toolsets=["web"],
    quiet_mode=True,
)

# 启用大部分能力，但禁用 terminal
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    disabled_toolsets=["terminal"],
    quiet_mode=True,
)
```

:::tip
如果你想要一个最小权限、锁得很紧的 Agent，比如只允许网页搜索做研究机器人，就用 `enabled_toolsets`。如果你希望保留大部分能力，只是需要限制少数几项，比如共享环境里不允许终端访问，就用 `disabled_toolsets`。
:::

---

## 多轮对话

如果你希望在多个回合间保留上下文，可以把消息历史继续传回去：

```python
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    quiet_mode=True,
)

# 第一轮
result1 = agent.run_conversation("My name is Alice")
history = result1["messages"]

# 第二轮，Agent 会记得上下文
result2 = agent.run_conversation(
    "What's my name?",
    conversation_history=history,
)
print(result2["final_response"])  # "Your name is Alice."
```

`conversation_history` 接收的是上一轮返回的 `messages` 列表。Agent 内部会复制这份历史，因此不会直接改动你原始的列表对象。

---

## 保存轨迹数据

开启 trajectory 保存后，Hermes 会把对话以 ShareGPT 格式写下来，适合做训练数据收集或调试：

```python
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    save_trajectories=True,
    quiet_mode=True,
)

agent.chat("Write a Python function to sort a list")
# Saves to trajectory_samples.jsonl in ShareGPT format
```

每次对话会以一行 JSONL 追加写入，便于从自动化运行中持续积累数据集。

---

## 自定义系统提示

你可以用 `ephemeral_system_prompt` 来设定一个自定义 system prompt，以引导 Agent 行为，但这个提示词**不会**写入 trajectory 文件，从而保持训练数据干净：

```python
agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    ephemeral_system_prompt="You are a SQL expert. Only answer database questions.",
    quiet_mode=True,
)

response = agent.chat("How do I write a JOIN query?")
print(response)
```

这非常适合构建专用型 Agent，例如代码审查助手、文档编写助手或 SQL 助手，而底层仍然复用同一套工具能力。

---

## 批处理

如果你要并行跑大量 prompt，Hermes 自带 `batch_runner.py`，会帮你管理多个 `AIAgent` 实例，并做好资源隔离：

```bash
python batch_runner.py --input prompts.jsonl --output results.jsonl
```

每条 prompt 都会拿到自己的 `task_id` 和隔离环境。如果你需要自定义批处理逻辑，也可以直接基于 `AIAgent` 自己搭：

```python
import concurrent.futures
from run_agent import AIAgent

prompts = [
    "Explain recursion",
    "What is a hash table?",
    "How does garbage collection work?",
]

def process_prompt(prompt):
    # Create a fresh agent per task for thread safety
    agent = AIAgent(
        model="anthropic/claude-sonnet-4",
        quiet_mode=True,
        skip_memory=True,
    )
    return agent.chat(prompt)

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    results = list(executor.map(process_prompt, prompts))

for prompt, result in zip(prompts, results):
    print(f"Q: {prompt}\nA: {result}\n")
```

:::warning
始终为**每个线程或任务创建一个新的 `AIAgent` 实例**。Agent 内部维护着会话历史、工具会话和迭代计数等状态，这些状态并不是线程安全的。
:::

---

## 集成示例

### FastAPI 接口

```python
from fastapi import FastAPI
from pydantic import BaseModel
from run_agent import AIAgent

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    model: str = "anthropic/claude-sonnet-4"

@app.post("/chat")
async def chat(request: ChatRequest):
    agent = AIAgent(
        model=request.model,
        quiet_mode=True,
        skip_context_files=True,
        skip_memory=True,
    )
    response = agent.chat(request.message)
    return {"response": response}
```

### Discord Bot

```python
import discord
from run_agent import AIAgent

client = discord.Client(intents=discord.Intents.default())

@client.event
async def on_message(message):
    if message.author == client.user:
        return
    if message.content.startswith("!hermes "):
        query = message.content[8:]
        agent = AIAgent(
            model="anthropic/claude-sonnet-4",
            quiet_mode=True,
            skip_context_files=True,
            skip_memory=True,
            platform="discord",
        )
        response = agent.chat(query)
        await message.channel.send(response[:2000])

client.run("YOUR_DISCORD_TOKEN")
```

### CI/CD 流水线步骤

```python
#!/usr/bin/env python3
"""CI step: auto-review a PR diff."""
import subprocess
from run_agent import AIAgent

diff = subprocess.check_output(["git", "diff", "main...HEAD"]).decode()

agent = AIAgent(
    model="anthropic/claude-sonnet-4",
    quiet_mode=True,
    skip_context_files=True,
    skip_memory=True,
    disabled_toolsets=["terminal", "browser"],
)

review = agent.chat(
    f"Review this PR diff for bugs, security issues, and style problems:\n\n{diff}"
)
print(review)
```

---

## 常用构造参数

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `model` | `str` | `"anthropic/claude-opus-4.6"` | OpenRouter 风格的模型名 |
| `quiet_mode` | `bool` | `False` | 是否抑制 CLI 输出 |
| `enabled_toolsets` | `List[str]` | `None` | 白名单方式启用指定工具集 |
| `disabled_toolsets` | `List[str]` | `None` | 黑名单方式禁用指定工具集 |
| `save_trajectories` | `bool` | `False` | 是否将对话保存为 JSONL |
| `ephemeral_system_prompt` | `str` | `None` | 自定义 system prompt（不会保存到 trajectories） |
| `max_iterations` | `int` | `90` | 单轮会话最多工具迭代次数 |
| `skip_context_files` | `bool` | `False` | 跳过加载 AGENTS.md |
| `skip_memory` | `bool` | `False` | 禁用持久记忆的读写 |
| `api_key` | `str` | `None` | API key（未提供时会回退到环境变量） |
| `base_url` | `str` | `None` | 自定义 API endpoint |
| `platform` | `str` | `None` | 平台提示（如 `"discord"`、`"telegram"`） |

---

## 重要说明

:::tip
- 如果你不希望当前工作目录下的 `AGENTS.md` 被自动加载到 system prompt，请设置 **`skip_context_files=True`**。
- 如果你要做无状态 API 接口，建议设置 **`skip_memory=True`**，避免 Agent 读写持久记忆。
- `platform` 参数（例如 `"discord"`、`"telegram"`）会注入平台特定的格式提示，让 Agent 自动调整输出风格。
:::

:::warning
- **线程安全**：每个线程或任务都单独创建一个 `AIAgent`，不要在并发调用之间共享实例。
- **资源清理**：当一轮会话结束后，Agent 会自动清理终端会话、浏览器实例等资源。如果你运行的是一个长生命周期进程，请确保每次会话都能正常结束。
- **迭代上限**：默认的 `max_iterations=90` 很宽松。对于简单问答场景，可以适当降低，例如 `max_iterations=10`，避免工具调用失控并控制成本。
:::
