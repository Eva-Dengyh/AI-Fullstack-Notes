---
sidebar_label: "构建插件"
title: "构建一个 Hermes 插件"
description: "一步一步构建完整的 Hermes 插件，涵盖工具、hooks、数据文件和 skills"
---

# 构建一个 Hermes 插件

这篇指南会带你从零开始构建一个完整的 Hermes 插件。完成后，你会得到一个可工作的插件，包含多个工具、生命周期 hook、随插件分发的数据文件，以及一个内置 skill，基本覆盖插件系统支持的主要能力。

## 你要构建什么

我们要做一个 **calculator** 插件，带有两个工具：
- `calculate`：计算数学表达式，例如 `2**16`、`sqrt(144)`、`pi * 5**2`
- `unit_convert`：单位换算，例如 `100 F → 37.78 C`、`5 km → 3.11 mi`

此外还会加一个 hook，用来记录每次工具调用，以及一个随插件一起分发的 skill 文件。

## 第 1 步：创建插件目录

```bash
mkdir -p ~/.hermes/plugins/calculator
cd ~/.hermes/plugins/calculator
```

## 第 2 步：编写 manifest

创建 `plugin.yaml`：

```yaml
name: calculator
version: 1.0.0
description: Math calculator — evaluate expressions and convert units
provides_tools:
  - calculate
  - unit_convert
provides_hooks:
  - post_tool_call
```

这相当于告诉 Hermes：“我是一个叫 calculator 的插件，我会提供工具和 hooks。” `provides_tools` 和 `provides_hooks` 都是列表，描述这个插件会注册什么。

你还可以增加一些可选字段：

```yaml
author: Your Name
requires_env:
  - SOME_API_KEY
  - name: OTHER_KEY
    description: "Key for the Other service"
    url: "https://other.com/keys"
    secret: true
```

其中 `requires_env` 可以让插件在缺少某些环境变量时不被加载，并在安装时提示用户补齐。

## 第 3 步：编写工具 schema

创建 `schemas.py`。这是 LLM 用来判断“何时应该调用你的工具”的信息来源：

```python
"""Tool schemas — what the LLM sees."""

CALCULATE = {
    "name": "calculate",
    "description": (
        "Evaluate a mathematical expression and return the result. "
        "Supports arithmetic (+, -, *, /, **), functions (sqrt, sin, cos, "
        "log, abs, round, floor, ceil), and constants (pi, e). "
        "Use this for any math the user asks about."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "expression": {
                "type": "string",
                "description": "Math expression to evaluate (e.g., '2**10', 'sqrt(144)')",
            },
        },
        "required": ["expression"],
    },
}

UNIT_CONVERT = {
    "name": "unit_convert",
    "description": (
        "Convert a value between units. Supports length (m, km, mi, ft, in), "
        "weight (kg, lb, oz, g), temperature (C, F, K), data (B, KB, MB, GB, TB), "
        "and time (s, min, hr, day)."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "value": {
                "type": "number",
                "description": "The numeric value to convert",
            },
            "from_unit": {
                "type": "string",
                "description": "Source unit (e.g., 'km', 'lb', 'F', 'GB')",
            },
            "to_unit": {
                "type": "string",
                "description": "Target unit (e.g., 'mi', 'kg', 'C', 'MB')",
            },
        },
        "required": ["value", "from_unit", "to_unit"],
    },
}
```

**为什么 schema 很重要：** `description` 决定 LLM 会在什么情况下调用你的工具。描述要足够具体，说明它做什么、什么时候应该用。`parameters` 则定义模型会传入哪些参数。

## 第 4 步：编写工具处理函数

创建 `tools.py`。这里放的是工具真正执行时运行的代码：

```python
"""Tool handlers — the code that runs when the LLM calls each tool."""

import json
import math

# Safe globals for expression evaluation — no file/network access
_SAFE_MATH = {
    "abs": abs, "round": round, "min": min, "max": max,
    "pow": pow, "sqrt": math.sqrt, "sin": math.sin, "cos": math.cos,
    "tan": math.tan, "log": math.log, "log2": math.log2, "log10": math.log10,
    "floor": math.floor, "ceil": math.ceil,
    "pi": math.pi, "e": math.e,
    "factorial": math.factorial,
}


def calculate(args: dict, **kwargs) -> str:
    """Evaluate a math expression safely.

    Rules for handlers:
    1. Receive args (dict) — the parameters the LLM passed
    2. Do the work
    3. Return a JSON string — ALWAYS, even on error
    4. Accept **kwargs for forward compatibility
    """
    expression = args.get("expression", "").strip()
    if not expression:
        return json.dumps({"error": "No expression provided"})

    try:
        result = eval(expression, {"__builtins__": {}}, _SAFE_MATH)
        return json.dumps({"expression": expression, "result": result})
    except ZeroDivisionError:
        return json.dumps({"expression": expression, "error": "Division by zero"})
    except Exception as e:
        return json.dumps({"expression": expression, "error": f"Invalid: {e}"})


# Conversion tables — values are in base units
_LENGTH = {"m": 1, "km": 1000, "mi": 1609.34, "ft": 0.3048, "in": 0.0254, "cm": 0.01}
_WEIGHT = {"kg": 1, "g": 0.001, "lb": 0.453592, "oz": 0.0283495}
_DATA = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3, "TB": 1024**4}
_TIME = {"s": 1, "ms": 0.001, "min": 60, "hr": 3600, "day": 86400}


def _convert_temp(value, from_u, to_u):
    # Normalize to Celsius
    c = {"F": (value - 32) * 5/9, "K": value - 273.15}.get(from_u, value)
    # Convert to target
    return {"F": c * 9/5 + 32, "K": c + 273.15}.get(to_u, c)


def unit_convert(args: dict, **kwargs) -> str:
    """Convert between units."""
    value = args.get("value")
    from_unit = args.get("from_unit", "").strip()
    to_unit = args.get("to_unit", "").strip()

    if value is None or not from_unit or not to_unit:
        return json.dumps({"error": "Need value, from_unit, and to_unit"})

    try:
        # Temperature
        if from_unit.upper() in {"C","F","K"} and to_unit.upper() in {"C","F","K"}:
            result = _convert_temp(float(value), from_unit.upper(), to_unit.upper())
            return json.dumps({"input": f"{value} {from_unit}", "result": round(result, 4),
                             "output": f"{round(result, 4)} {to_unit}"})

        # Ratio-based conversions
        for table in (_LENGTH, _WEIGHT, _DATA, _TIME):
            lc = {k.lower(): v for k, v in table.items()}
            if from_unit.lower() in lc and to_unit.lower() in lc:
                result = float(value) * lc[from_unit.lower()] / lc[to_unit.lower()]
                return json.dumps({"input": f"{value} {from_unit}",
                                 "result": round(result, 6),
                                 "output": f"{round(result, 6)} {to_unit}"})

        return json.dumps({"error": f"Cannot convert {from_unit} → {to_unit}"})
    except Exception as e:
        return json.dumps({"error": f"Conversion failed: {e}"})
```

**处理函数的关键规则：**
1. **签名必须是**：`def my_handler(args: dict, **kwargs) -> str`
2. **返回值必须是** JSON 字符串，成功和失败都一样
3. **不要抛异常**：捕获所有异常，转成错误 JSON 返回
4. **接收 `**kwargs`**：为了兼容未来 Hermes 传入的额外上下文

## 第 5 步：编写注册逻辑

创建 `__init__.py`，把 schema 和 handler 连接起来：

```python
"""Calculator plugin — registration."""

import logging

from . import schemas, tools

logger = logging.getLogger(__name__)

# Track tool usage via hooks
_call_log = []

def _on_post_tool_call(tool_name, args, result, task_id, **kwargs):
    """Hook: runs after every tool call (not just ours)."""
    _call_log.append({"tool": tool_name, "session": task_id})
    if len(_call_log) > 100:
        _call_log.pop(0)
    logger.debug("Tool called: %s (session %s)", tool_name, task_id)


def register(ctx):
    """Wire schemas to handlers and register hooks."""
    ctx.register_tool(name="calculate",    toolset="calculator",
                      schema=schemas.CALCULATE,    handler=tools.calculate)
    ctx.register_tool(name="unit_convert", toolset="calculator",
                      schema=schemas.UNIT_CONVERT, handler=tools.unit_convert)

    # This hook fires for ALL tool calls, not just ours
    ctx.register_hook("post_tool_call", _on_post_tool_call)
```

`register()` 做的事情包括：
- 启动时只调用一次
- `ctx.register_tool()` 会把工具放进注册表，模型能立刻看到
- `ctx.register_hook()` 会把回调挂到生命周期事件上
- `ctx.register_cli_command()` 可以注册 CLI 子命令，例如 `hermes my-plugin <subcommand>`
- 如果这里抛异常，插件会被禁用，但 Hermes 仍会继续工作

## 第 6 步：测试

启动 Hermes：

```bash
hermes
```

你应该能在 banner 的工具列表中看到 `calculator: calculate, unit_convert`。

可以试试这些提示词：

```
What's 2 to the power of 16?
Convert 100 fahrenheit to celsius
What's the square root of 2 times pi?
How many gigabytes is 1.5 terabytes?
```

查看插件状态：

```
/plugins
```

输出应该类似：

```
Plugins (1):
  ✓ calculator v1.0.0 (2 tools, 1 hooks)
```

## 插件最终目录结构

```
~/.hermes/plugins/calculator/
├── plugin.yaml      # “我是 calculator，我会提供工具和 hooks”
├── __init__.py      # 连接 schemas → handlers，并注册 hooks
├── schemas.py       # LLM 读取的描述与参数规范
└── tools.py         # 真正执行的逻辑
```

这 4 个文件职责清晰：
- **Manifest** 声明插件是什么
- **Schemas** 描述 LLM 应该如何使用工具
- **Handlers** 实现实际逻辑
- **Registration** 把一切接起来

## 插件还能做什么

### 随插件分发数据文件

你可以把任意文件放进插件目录中，并在导入时读取它们：

```python
# In tools.py or __init__.py
from pathlib import Path

_PLUGIN_DIR = Path(__file__).parent
_DATA_FILE = _PLUGIN_DIR / "data" / "languages.yaml"

with open(_DATA_FILE) as f:
    _DATA = yaml.safe_load(f)
```

### 打包一个 skill

你可以附带一个 `skill.md`，并在注册时把它安装到 `~/.hermes/skills/`：

```python
import shutil
from pathlib import Path

def _install_skill():
    """Copy our skill to ~/.hermes/skills/ on first load."""
    try:
        from hermes_cli.config import get_hermes_home
        dest = get_hermes_home() / "skills" / "my-plugin" / "SKILL.md"
    except Exception:
        dest = Path.home() / ".hermes" / "skills" / "my-plugin" / "SKILL.md"

    if dest.exists():
        return  # don't overwrite user edits

    source = Path(__file__).parent / "skill.md"
    if source.exists():
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, dest)

def register(ctx):
    ctx.register_tool(...)
    _install_skill()
```

### 依赖环境变量

如果插件需要 API key：

```yaml
requires_env:
  - WEATHER_API_KEY
```

如果 `WEATHER_API_KEY` 没有设置，插件会被优雅地禁用，并显示清晰提示，而不是把整个 Agent 搞挂。

为了获得更好的安装体验，可以使用 richer 格式：

```yaml
requires_env:
  - name: WEATHER_API_KEY
    description: "API key for OpenWeather"
    url: "https://openweathermap.org/api"
    secret: true
```

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| `name` | 是 | 环境变量名 |
| `description` | 否 | 安装提示时展示给用户 |
| `url` | 否 | 去哪里获取这个凭据 |
| `secret` | 否 | 为 `true` 时输入会被隐藏 |

两种格式可以混用。已经设置过的变量会被静默跳过。

### 条件性暴露工具

如果某个工具依赖可选库，可以这样注册：

```python
ctx.register_tool(
    name="my_tool",
    schema={...},
    handler=my_handler,
    check_fn=lambda: _has_optional_lib(),
)
```

当 `check_fn` 返回 `False` 时，这个工具不会暴露给模型。

### 注册多个 hooks

```python
def register(ctx):
    ctx.register_hook("pre_tool_call", before_any_tool)
    ctx.register_hook("post_tool_call", after_any_tool)
    ctx.register_hook("pre_llm_call", inject_memory)
    ctx.register_hook("on_session_start", on_new_session)
    ctx.register_hook("on_session_end", on_session_end)
```

### Hook 参考

完整 hook 文档见 [Event Hooks reference](/docs/user-guide/features/hooks#plugin-hooks)。这里给出摘要：

| Hook | 触发时机 | 回调签名 | 返回值 |
|------|-----------|-------------------|---------|
| `pre_tool_call` | 任意工具执行前 | `tool_name: str, args: dict, task_id: str` | 忽略 |
| `post_tool_call` | 任意工具返回后 | `tool_name: str, args: dict, result: str, task_id: str` | 忽略 |
| `pre_llm_call` | 每轮进入工具调用循环前 | `session_id: str, user_message: str, conversation_history: list, is_first_turn: bool, model: str, platform: str` | 可注入上下文 |
| `post_llm_call` | 每轮工具调用循环后（成功轮次） | `session_id: str, user_message: str, assistant_response: str, conversation_history: list, model: str, platform: str` | 忽略 |
| `on_session_start` | 新会话创建时 | `session_id: str, model: str, platform: str` | 忽略 |
| `on_session_end` | 每次 `run_conversation` 结束 + CLI 退出 | `session_id: str, completed: bool, interrupted: bool, model: str, platform: str` | 忽略 |
| `pre_api_request` | 每次向 LLM provider 发 HTTP 请求前 | `method: str, url: str, headers: dict, body: dict` | 忽略 |
| `post_api_request` | 每次从 LLM provider 收到响应后 | `method: str, url: str, status_code: int, response: dict` | 忽略 |

大多数 hook 都是“看一眼就走”的 observer，返回值会被忽略。唯一例外是 `pre_llm_call`，它可以向当前轮对话注入额外上下文。

所有回调都应该接收 `**kwargs`，以保证前向兼容。如果 hook 崩了，只会记录日志并跳过该 hook，不会中断整个 Agent。

### `pre_llm_call` 上下文注入

这是唯一一个返回值有意义的 hook。如果 `pre_llm_call` 回调返回一个带 `"context"` 键的字典，或直接返回一个字符串，Hermes 会把该文本注入到**当前轮的 user message** 中。这正是 memory 插件、RAG 集成、guardrails 等扩展的核心机制。

返回格式示例：

```python
return {"context": "Recalled memories:\n- User prefers dark mode"}
```

或：

```python
return "Recalled memories:\n- User prefers dark mode"
```

如果返回 `None`，就表示不注入内容，只作为 observer 使用。

为什么注入到 user message，而不是 system prompt：
- **保留 prompt cache**：system prompt 保持稳定，更容易命中缓存，能节省大量输入 token
- **注入是临时的**：只影响本轮 API 调用，不会修改会话历史，也不会持久化
- **system prompt 属于 Hermes 核心控制区**：包含模型指导、工具规则、人格和缓存 skill 内容，插件不应直接篡改它

### 注册 CLI 命令

插件还可以增加自己的 `hermes <plugin>` 子命令树：

```python
def _my_command(args):
    sub = getattr(args, "my_command", None)
    if sub == "status":
        print("All good!")
    elif sub == "config":
        print("Current config: ...")
    else:
        print("Usage: hermes my-plugin <status|config>")

def _setup_argparse(subparser):
    subs = subparser.add_subparsers(dest="my_command")
    subs.add_parser("status", help="Show plugin status")
    subs.add_parser("config", help="Show plugin config")
    subparser.set_defaults(func=_my_command)

def register(ctx):
    ctx.register_tool(...)
    ctx.register_cli_command(
        name="my-plugin",
        help="Manage my plugin",
        setup_fn=_setup_argparse,
        handler_fn=_my_command,
    )
```

注册后，用户就可以运行 `hermes my-plugin status`、`hermes my-plugin config` 等命令。

对于 memory provider 插件，则采用约定优于配置的方式：在 `cli.py` 中增加 `register_cli(subparser)` 函数即可，无需显式调用 `ctx.register_cli_command()`。详见 [Memory Provider Plugin guide](/docs/developer-guide/memory-provider-plugin#adding-cli-commands)。

### 通过 pip 分发

如果你想公开分享插件，可以在 Python 包中添加 entry point：

```toml
[project.entry-points."hermes_agent.plugins"]
my-plugin = "my_plugin_package"
```

```bash
pip install hermes-plugin-calculator
```

安装后，插件会在下一次 Hermes 启动时自动发现。

## 常见错误

**处理函数没有返回 JSON 字符串：**

```python
# Wrong
def handler(args, **kwargs):
    return {"result": 42}

# Right
def handler(args, **kwargs):
    return json.dumps({"result": 42})
```

**处理函数签名里漏了 `**kwargs`：**

```python
# Wrong
def handler(args):
    ...

# Right
def handler(args, **kwargs):
    ...
```

**处理函数抛出异常：**

```python
# Wrong
def handler(args, **kwargs):
    result = 1 / int(args["value"])
    return json.dumps({"result": result})

# Right
def handler(args, **kwargs):
    try:
        result = 1 / int(args.get("value", 0))
        return json.dumps({"result": result})
    except Exception as e:
        return json.dumps({"error": str(e)})
```

**Schema 描述过于模糊：**

```python
# Bad
"description": "Does stuff"

# Good
"description": "Evaluate a mathematical expression. Use for arithmetic, trig, logarithms. Supports: +, -, *, /, **, sqrt, sin, cos, log, pi, e."
```
