---
title: "Event Hooks（事件钩子）"
description: "在关键生命周期点运行自定义代码 — 记录活动、发送警报、发布到 webhooks"
---

# Event Hooks（事件钩子）

Hermes 有两个 hook 系统在关键生命周期点运行自定义代码：

| 系统 | 通过以下注册 | 运行于 | 使用情景 |
|--------|---------------|---------|----------|
| **[网关 hooks](#gateway-event-hooks)** | `~/.hermes/hooks/` 中的 `HOOK.yaml` + `handler.py` | 仅网关 | 记录、警报、webhooks |
| **[插件 hooks](#plugin-hooks)** | 插件中的 `ctx.register_hook()| CLI + 网关 | 工具拦截、指标、guardrails |

两个系统都是非阻塞的 — 任何 hook 中的错误被捕获和记录，绝不崩溃 Agent。

## 网关事件 Hooks

网关 hooks 在网关操作期间自动触发（Telegram、Discord、Slack、WhatsApp）而不阻止主 Agent 管道。

### 创建一个 Hook

每个 hook 是 `~/.hermes/hooks/` 下的一个目录包含两个文件：

```text
~/.hermes/hooks/
└── my-hook/
    ├── HOOK.yaml      # 声明要监听哪些事件
    └── handler.py     # Python 处理器函数
```

#### HOOK.yaml

```yaml
name: my-hook
description: Log all agent activity to a file
events:
  - agent:start
  - agent:end
  - agent:step
```

`events` 列表确定哪些事件触发你的处理器。你可以订阅任何事件组合，包括通配符如 `command:*`。

#### handler.py

```python
import json
from datetime import datetime
from pathlib import Path

LOG_FILE = Path.home() / ".hermes" / "hooks" / "my-hook" / "activity.log"

async def handle(event_type: str, context: dict):
    """为每个订阅事件调用。必须命名为 'handle'。"""
    entry = {
        "timestamp": datetime.now().isoformat(),
        "event": event_type,
        **context,
    }
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")
```

**处理器规则：**
- 必须命名 `handle`
- 接收 `event_type`（字符串）和 `context`（字典）
- 可以是 `async def` 或常规 `def` — 两个都工作
- 错误被捕获和记录，绝不崩溃 Agent

### 可用事件

| 事件 | 何时触发 | 上下文键 |
|-------|---------------|--------------|
| `gateway:startup` | 网关进程启动 | `platforms`（活跃平台名称列表） |
| `session:start` | 新消息传递会话创建 | `platform`、`user_id`、`session_id`、`session_key` |
| `session:end` | 会话结束（在重置之前） | `platform`、`user_id`、`session_key` |
| `session:reset` | 用户运行 `/new` 或 `/reset` | `platform`、`user_id`、`session_key` |
| `agent:start` | Agent 开始处理消息 | `platform`、`user_id`、`session_id`、`message` |
| `agent:step` | 工具调用循环的每个迭代 | `platform`、`user_id`、`session_id`、`iteration`、`tool_names` |
| `agent:end` | Agent 完成处理 | `platform`、`user_id`、`session_id`、`message`、`response` |
| `command:*` | 任何斜杠命令执行 | `platform`、`user_id`、`command`、`args` |

#### 通配符匹配

为 `command:*` 注册的处理器触发任何 `command:` 事件（`command:model`、`command:reset` 等）。用单个订阅监视所有斜杠命令。

### 示例

#### 启动检查单（BOOT.md）— 内置

网关附带一个内置 `boot-md` hook 在每个启动时查找 `~/.hermes/BOOT.md`。如果文件存在，Agent 在后台会话中运行其指导。无需安装 — 只需创建文件。

**创建 `~/.hermes/BOOT.md`：**

```markdown
# 启动检查单

1. 检查任何 cron 作业是否在夜间失败 — 运行 `hermes cron list`
2. 发送消息到 Discord #general 说 "网关重启，所有系统运作"
3. 检查 /opt/app/deploy.log 是否有最后 24 小时的任何错误
```

Agent 在后台线程中运行这些指导使其不阻止网关启动。如果没有什么需要注意，Agent 回复 `[SILENT]` 且没有消息被交付。

:::tip
没有 BOOT.md？hook 静默跳过 — 零开销。在需要启动自动化时创建文件，不需要时删除。
:::

#### 长任务的 Telegram 警报

在 Agent 需要超过 10 步时发自己一条消息：

```yaml
# ~/.hermes/hooks/long-task-alert/HOOK.yaml
name: long-task-alert
description: Alert when agent is taking many steps
events:
  - agent:step
```

```python
# ~/.hermes/hooks/long-task-alert/handler.py
import os
import httpx

THRESHOLD = 10
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_HOME_CHANNEL")

async def handle(event_type: str, context: dict):
    iteration = context.get("iteration", 0)
    if iteration == THRESHOLD and BOT_TOKEN and CHAT_ID:
        tools = ", ".join(context.get("tool_names", []))
        text = f"⚠️ Agent 已经运行 {iteration} 步。最后工具：{tools}"
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
                json={"chat_id": CHAT_ID, "text": text},
            )
```

#### 命令使用日志记录器

跟踪使用了哪个斜杠命令：

```yaml
# ~/.hermes/hooks/command-logger/HOOK.yaml
name: command-logger
description: Log slash command usage
events:
  - command:*
```

```python
# ~/.hermes/hooks/command-logger/handler.py
import json
from datetime import datetime
from pathlib import Path

LOG = Path.home() / ".hermes" / "logs" / "command_usage.jsonl"

def handle(event_type: str, context: dict):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    entry = {
        "ts": datetime.now().isoformat(),
        "command": context.get("command"),
        "args": context.get("args"),
        "platform": context.get("platform"),
        "user": context.get("user_id"),
    }
    with open(LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
```

#### 会话启动 Webhook

发布到外部服务在新会话：

```yaml
# ~/.hermes/hooks/session-webhook/HOOK.yaml
name: session-webhook
description: Notify external service on new sessions
events:
  - session:start
  - session:reset
```

```python
# ~/.hermes/hooks/session-webhook/handler.py
import httpx

WEBHOOK_URL = "https://your-service.example.com/hermes-events"

async def handle(event_type: str, context: dict):
    async with httpx.AsyncClient() as client:
        await client.post(WEBHOOK_URL, json={
            "event": event_type,
            **context,
        }, timeout=5)
```

### 工作原理

1. 在网关启动时，`HookRegistry.discover_and_load()` 扫描 `~/.hermes/hooks/`
2. 每个带 `HOOK.yaml` + `handler.py` 的子目录被动态加载
3. 处理器为他们声明的事件注册
4. 在每个生命周期点，`hooks.emit()` 触发所有匹配的处理器
5. 任何处理器中的错误被捕获和记录 — 破损的 hook 绝不崩溃 Agent

:::info
网关 hooks 仅在**网关**（Telegram、Discord、Slack、WhatsApp）中触发。CLI 不加载网关 hooks。对于在各处工作的 hooks，使用 [插件 hooks](#plugin-hooks)。
:::

## 插件 Hooks

[插件](/docs/user-guide/features/plugins) 可以注册在 **CLI 和网关**会话中触发的 hooks。这些通过你插件的 `register()` 函数中的 `ctx.register_hook()` 编程方式注册。

```python
def register(ctx):
    ctx.register_hook("pre_tool_call", my_tool_observer)
    ctx.register_hook("post_tool_call", my_tool_logger)
    ctx.register_hook("pre_llm_call", my_memory_callback)
    ctx.register_hook("post_llm_call", my_sync_callback)
    ctx.register_hook("on_session_start", my_init_callback)
    ctx.register_hook("on_session_end", my_cleanup_callback)
```

**所有 hooks 的一般规则：**

- 回调接收**关键字参数**。总是接受 `**kwargs` 用于前向兼容 — 新参数可能在未来版本中添加而不破坏你的插件。
- 如果一个回调**崩溃**，它被记录和跳过。其他 hooks 和 Agent 继续正常。一个表现不佳的插件可以绝不破坏 Agent。
- 所有 hooks 是**开火忘记观察者**其返回值被忽略 — 除了 `pre_llm_call`，它可以 [注入上下文](#pre_llm_call)。

### 快速参考

| Hook | 何时触发 | 返回 |
|------|-----------|---------|
| [`pre_tool_call`](#pre_tool_call) | 任何工具执行之前 | 忽略 |
| [`post_tool_call`](#post_tool_call) | 任何工具返回后 | 忽略 |
| [`pre_llm_call`](#pre_llm_call) | 每轮一次，工具调用循环之前 | 上下文注入 |
| [`post_llm_call`](#post_llm_call) | 每轮一次，工具调用循环后 | 忽略 |
| [`on_session_start`](#on_session_start) | 新会话创建（仅第一轮） | 忽略 |
| [`on_session_end`](#on_session_end) | 会话结束 | 忽略 |

---

### `pre_tool_call`

立即在每个工具执行之前触发 — 内置工具和插件工具一样。

**回调签名：**

```python
def my_callback(tool_name: str, args: dict, task_id: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `tool_name` | `str` | 关于执行的工具名称（例如 `"terminal"`、`"web_search"`、`"read_file"`) |
| `args` | `dict` | 模型传递给工具的参数 |
| `task_id` | `str` | 会话/任务标识符。如果未设置则为空字符串。 |

**触发：** 在 `model_tools.py` 中，在 `handle_function_call()` 内部，工具的处理器运行前。每个工具调用触发一次 — 如果模型调用 3 个工具平行，这触发 3 次。

**返回值：** 忽略。

**使用案例：** 记录、审计跟踪、工具调用计数器、阻止危险操作（打印警告）、速率限制。

**示例 — 工具调用审计日志：**

```python
import json, logging
from datetime import datetime

logger = logging.getLogger(__name__)

def audit_tool_call(tool_name, args, task_id, **kwargs):
    logger.info("TOOL_CALL session=%s tool=%s args=%s",
                task_id, tool_name, json.dumps(args)[:200])

def register(ctx):
    ctx.register_hook("pre_tool_call", audit_tool_call)
```

**示例 — 在危险工具上警告：**

```python
DANGEROUS = {"terminal", "write_file", "patch"}

def warn_dangerous(tool_name, **kwargs):
    if tool_name in DANGEROUS:
        print(f"⚠ 执行可能危险的工具：{tool_name}")

def register(ctx):
    ctx.register_hook("pre_tool_call", warn_dangerous)
```

---

### `post_tool_call`

立即在每个工具执行返回后触发。

**回调签名：**

```python
def my_callback(tool_name: str, args: dict, result: str, task_id: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `tool_name` | `str` | 刚刚执行的工具名称 |
| `args` | `dict` | 模型传递给工具的参数 |
| `result` | `str` | 工具的返回值（总是一个 JSON 字符串） |
| `task_id` | `str` | 会话/任务标识符。如果未设置则为空字符串。 |

**触发：** 在 `model_tools.py` 中，在 `handle_function_call()` 内部，工具的处理器返回后。每个工具调用触发一次。不触发如果工具抬起未处理的异常（错误被捕获并作为错误 JSON 字符串返回，且 `post_tool_call` 以那个错误字符串作为 `result` 触发）。

**返回值：** 忽略。

**使用案例：** 记录工具结果、指标收集、跟踪工具成功/失败率、在特定工具完成时发送通知。

**示例 — 跟踪工具使用指标：**

```python
from collections import Counter
import json

_tool_counts = Counter()
_error_counts = Counter()

def track_metrics(tool_name, result, **kwargs):
    _tool_counts[tool_name] += 1
    try:
        parsed = json.loads(result)
        if "error" in parsed:
            _error_counts[tool_name] += 1
    except (json.JSONDecodeError, TypeError):
        pass

def register(ctx):
    ctx.register_hook("post_tool_call", track_metrics)
```

---

### `pre_llm_call`

每轮一次触发，工具调用循环开始前。这是**唯一的 hook 其返回值被使用** — 它可以注入上下文到当前轮的用户消息。

**回调签名：**

```python
def my_callback(session_id: str, user_message: str, conversation_history: list,
                is_first_turn: bool, model: str, platform: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `session_id` | `str` | 当前会话的唯一标识符 |
| `user_message` | `str` | 此轮的用户原始消息（在任何技能注入前） |
| `conversation_history` | `list` | 完整消息列表副本（OpenAI 格式：`[{"role": "user", "content": "..."}]`) |
| `is_first_turn` | `bool` | `True` 如果这是新会话的第一轮，`False` 在后续轮 |
| `model` | `str` | 模型标识符（例如 `"anthropic/claude-sonnet-4.6"`) |
| `platform` | `str` | 会话运行的地方：`"cli"`、`"telegram"`、`"discord"` 等 |

**触发：** 在 `run_agent.py` 中，在 `run_conversation()` 内部，在上下文压缩后但工具调用循环主要 `while` 前。每个 `run_conversation()` 调用触发一次（即每个用户轮一次），不是每个工具调用循环内的 API 调用一次。

**返回值：** 如果回调返回一个字典带 `"context"` 键，或一个纯非空字符串，文本被附加到当前轮的用户消息。返回 `None` 不注入。

```python
# 注入上下文
return {"context": "回忆的内存：\n- 用户喜欢 Python\n- 在 hermes-agent 上工作"}

# 纯字符串（等价）
return "回忆的内存：\n- 用户喜欢 Python"

# 不注入
return None
```

**上下文注入的位置：** 总是**用户消息**，绝不系统提示。这保留提示缓存 — 系统提示跨轮保持相同，使缓存的令牌被重用。系统提示是 Hermes 的领地（模型指导、工具强制、个性、技能）。插件贡献上下文与用户的输入。

所有注入的上下文是**短期的** — 仅在 API 调用时添加。对话历史中的原始用户消息绝不被变更，也没有什么被持久化到会话数据库。

当**多个插件**返回上下文时，他们的输出与双换行在插件发现顺序（按目录名字母）加入。

**使用案例：** 内存回忆、RAG 上下文注入、guardrails、每轮分析。

**示例 — 内存回忆：**

```python
import httpx

MEMORY_API = "https://your-memory-api.example.com"

def recall(session_id, user_message, is_first_turn, **kwargs):
    try:
        resp = httpx.post(f"{MEMORY_API}/recall", json={
            "session_id": session_id,
            "query": user_message,
        }, timeout=3)
        memories = resp.json().get("results", [])
        if not memories:
            return None
        text = "回忆的上下文：\n" + "\n".join(f"- {m['text']}" for m in memories)
        return {"context": text}
    except Exception:
        return None

def register(ctx):
    ctx.register_hook("pre_llm_call", recall)
```

**示例 — guardrails：**

```python
POLICY = "绝不执行删除文件的命令而不显式用户确认。"

def guardrails(**kwargs):
    return {"context": POLICY}

def register(ctx):
    ctx.register_hook("pre_llm_call", guardrails)
```

---

### `post_llm_call`

每轮一次触发，工具调用循环完成且 Agent 产生最终响应后。仅在**成功**轮触发 — 轮如果被中断则不触发。

**回调签名：**

```python
def my_callback(session_id: str, user_message: str, assistant_response: str,
                conversation_history: list, model: str, platform: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `session_id` | `str` | 当前会话的唯一标识符 |
| `user_message` | `str` | 此轮的用户原始消息 |
| `assistant_response` | `str` | 此轮 Agent 的最终文本响应 |
| `conversation_history` | `list` | 轮完成后的完整消息列表副本 |
| `model` | `str` | 模型标识符 |
| `platform` | `str` | 会话运行的地方 |

**触发：** 在 `run_agent.py` 中，在 `run_conversation()` 内部，工具循环以最终响应退出后。由 `if final_response and not interrupted` 守护 — 所以它不触发当用户中断中轮或 Agent 点击迭代限制而不产生响应。

**返回值：** 忽略。

**使用案例：** 同步对话数据到外部内存系统、计算响应质量指标、记录轮摘要、触发后续动作。

**示例 — 同步到外部内存：**

```python
import httpx

MEMORY_API = "https://your-memory-api.example.com"

def sync_memory(session_id, user_message, assistant_response, **kwargs):
    try:
        httpx.post(f"{MEMORY_API}/store", json={
            "session_id": session_id,
            "user": user_message,
            "assistant": assistant_response,
        }, timeout=5)
    except Exception:
        pass  # best-effort

def register(ctx):
    ctx.register_hook("post_llm_call", sync_memory)
```

**示例 — 跟踪响应长度：**

```python
import logging
logger = logging.getLogger(__name__)

def log_response_length(session_id, assistant_response, model, **kwargs):
    logger.info("RESPONSE session=%s model=%s chars=%d",
                session_id, model, len(assistant_response or ""))

def register(ctx):
    ctx.register_hook("post_llm_call", log_response_length)
```

---

### `on_session_start`

当全新会话创建时**一次**触发。当用户在现有会话中发送第二条消息时不触发（会话延续）。

**回调签名：**

```python
def my_callback(session_id: str, model: str, platform: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `session_id` | `str` | 新会话的唯一标识符 |
| `model` | `str` | 模型标识符 |
| `platform` | `str` | 会话运行的地方 |

**触发：** 在 `run_agent.py` 中，在 `run_conversation()` 内部，新会话的第一轮期间 — 具体在系统提示被构建后但工具循环启动前。检查是 `if not conversation_history`（无之前消息 = 新会话）。

**返回值：** 忽略。

**使用案例：** 初始化会话限定状态、温热缓存、与外部服务注册会话、记录会话启动。

**示例 — 初始化一个会话缓存：**

```python
_session_caches = {}

def init_session(session_id, model, platform, **kwargs):
    _session_caches[session_id] = {
        "model": model,
        "platform": platform,
        "tool_calls": 0,
        "started": __import__("datetime").datetime.now().isoformat(),
    }

def register(ctx):
    ctx.register_hook("on_session_start", init_session)
```

---

### `on_session_end`

在每个 `run_conversation()` 调用的**非常结束**触发，不管结果。也从 CLI 的退出处理器触发如果 Agent 中途轮当用户退出。

**回调签名：**

```python
def my_callback(session_id: str, completed: bool, interrupted: bool,
                model: str, platform: str, **kwargs):
```

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| `session_id` | `str` | 会话的唯一标识符 |
| `completed` | `bool` | `True` 如果 Agent 产生最终响应，`False` 否则 |
| `interrupted` | `bool` | `True` 如果轮被中断（用户新消息、`/stop` 或退出） |
| `model` | `str` | 模型标识符 |
| `platform` | `str` | 会话运行的地方 |

**触发：** 在两个地方：
1. **`run_agent.py`** — 在每个 `run_conversation()` 调用结束，在所有清理后。总是触发，即使轮有错误。
2. **`cli.py`** — 在 CLI 的 atexit 处理器中，但**仅**如果 Agent 中途轮（`_agent_running=True`）当退出发生。这捕获 Ctrl+C 和 `/exit` 在处理期间。在这个情况下，`completed=False` 且 `interrupted=True`。

**返回值：** 忽略。

**使用案例：** 刷新缓冲区、关闭连接、持久化会话状态、记录会话时长、清理在 `on_session_start` 中初始化的资源。

**示例 — 刷新和清理：**

```python
_session_caches = {}

def cleanup_session(session_id, completed, interrupted, **kwargs):
    cache = _session_caches.pop(session_id, None)
    if cache:
        # 刷新累积的数据到磁盘或外部服务
        status = "completed" if completed else ("interrupted" if interrupted else "failed")
        print(f"会话 {session_id} 结束：{status}，{cache['tool_calls']} 工具调用")

def register(ctx):
    ctx.register_hook("on_session_end", cleanup_session)
```

**示例 — 会话时长跟踪：**

```python
import time, logging
logger = logging.getLogger(__name__)

_start_times = {}

def on_start(session_id, **kwargs):
    _start_times[session_id] = time.time()

def on_end(session_id, completed, interrupted, **kwargs):
    start = _start_times.pop(session_id, None)
    if start:
        duration = time.time() - start
        logger.info("SESSION_DURATION session=%s seconds=%.1f completed=%s interrupted=%s",
                     session_id, duration, completed, interrupted)

def register(ctx):
    ctx.register_hook("on_session_start", on_start)
    ctx.register_hook("on_session_end", on_end)
```

---

见**[构建插件指南](/docs/guides/build-a-hermes-plugin)**了解完整演练包括工具 schemas、处理器和高级 hook 模式。
