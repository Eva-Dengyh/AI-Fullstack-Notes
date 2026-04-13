---
sidebar_position: 2
title: "添加工具"
description: "如何为 Hermes Agent 添加新工具：schema、handler、注册流程以及 toolset 集成。"
---

# 添加工具

在写一个新工具之前，先问自己一句：**这个能力更适合作为 [Skill](./creating-skills_zh.md) 吗？**

- 当能力可以表达为“说明文档 + shell 命令 + 现有工具”的组合时，优先做成 Skill。
- 当能力需要 API 密钥、定制处理逻辑、二进制数据处理或流式交互时，再考虑做成 Tool。

## 总览

新增一个工具通常要改动 3 个地方：

1. `tools/your_tool.py`：写 handler、schema、可用性检查，并调用 `registry.register()`。
2. `toolsets.py`：把工具名加入某个 toolset。
3. `model_tools.py`：把工具模块加入 `_discover_tools()` 列表。

## 第 1 步：创建工具文件

一个标准工具文件一般包含 4 部分：

- Availability check：检测依赖或环境变量是否存在；
- Handler：真正执行业务逻辑；
- Schema：给模型看的参数定义；
- Registration：把工具注册到全局注册表中。

典型结构如下：

```python
# tools/weather_tool.py
"""Weather Tool -- look up current weather for a location."""

import json
import os
import logging

logger = logging.getLogger(__name__)


def check_weather_requirements() -> bool:
    """Return True if the tool's dependencies are available."""
    return bool(os.getenv("WEATHER_API_KEY"))


def weather_tool(location: str, units: str = "metric") -> str:
    """Fetch weather for a location. Returns JSON string."""
    api_key = os.getenv("WEATHER_API_KEY")
    if not api_key:
        return json.dumps({"error": "WEATHER_API_KEY not configured"})
    try:
        return json.dumps({"location": location, "temp": 22, "units": units})
    except Exception as e:
        return json.dumps({"error": str(e)})


WEATHER_SCHEMA = {
    "name": "weather",
    "description": "Get current weather for a location.",
    "parameters": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "City name or coordinates"
            },
            "units": {
                "type": "string",
                "enum": ["metric", "imperial"],
                "default": "metric"
            }
        },
        "required": ["location"]
    }
}


from tools.registry import registry

registry.register(
    name="weather",
    toolset="weather",
    schema=WEATHER_SCHEMA,
    handler=lambda args, **kw: weather_tool(
        location=args.get("location", ""),
        units=args.get("units", "metric")),
    check_fn=check_weather_requirements,
    requires_env=["WEATHER_API_KEY"],
)
```

### 关键规则

:::danger 重要
- Handler **必须**返回 JSON 字符串，也就是 `json.dumps(...)` 的结果，而不是原始 dict。
- 错误 **必须**作为 `{"error": "message"}` 返回，而不是直接抛异常给上层。
- `check_fn` 会在构建工具定义时被调用；返回 `False` 的工具会被静默排除。
- `handler` 的签名是 `(args: dict, **kwargs)`，其中 `args` 是模型传入的工具参数。
:::

## 第 2 步：加入 Toolset

在 `toolsets.py` 中把工具名加入合适的 toolset。

如果它应在所有平台都默认可用，可以加到核心工具列表；如果它是一个独立能力，则可以单独定义 toolset：

```python
_HERMES_CORE_TOOLS = [
    ...
    "weather",
]

"weather": {
    "description": "Weather lookup tools",
    "tools": ["weather"],
    "includes": []
},
```

## 第 3 步：加入发现列表

在 `model_tools.py` 的 `_discover_tools()` 中加入模块路径：

```python
def _discover_tools():
    _modules = [
        ...
        "tools.weather_tool",
    ]
```

这样在导入模块时，底部的 `registry.register()` 才会真正生效。

## 异步 Handler

如果工具本身需要异步执行，可以把 handler 标为 `is_async=True`：

```python
async def weather_tool_async(location: str) -> str:
    ...

registry.register(
    name="weather",
    toolset="weather",
    schema=WEATHER_SCHEMA,
    handler=lambda args, **kw: weather_tool_async(args.get("location", "")),
    check_fn=check_weather_requirements,
    is_async=True,
)
```

注册表会负责同步/异步桥接，你不需要自己在工具里调用 `asyncio.run()`。

## 需要 `task_id` 的 Handler

某些工具需要读取或维护会话级状态，此时可以通过 `**kwargs` 取出 `task_id`：

```python
def _handle_weather(args, **kw):
    task_id = kw.get("task_id")
    return weather_tool(args.get("location", ""), task_id=task_id)
```

这种模式适合需要会话上下文的工具。

## 被 Agent Loop 拦截的工具

有些工具虽然也注册在 registry 中，但真正执行时会先被 `run_agent.py` 拦截，例如：

- `todo`
- `memory`
- `session_search`
- `delegate_task`

这类工具通常需要访问 Agent 自身的运行态数据，不能完全通过通用 registry 执行。

## 可选：接入 Setup Wizard

如果你的工具依赖 API key，建议把配置项加入 `hermes_cli/config.py` 的 `OPTIONAL_ENV_VARS`，这样用户在 setup 向导中就能直接配置。

示例：

```python
OPTIONAL_ENV_VARS = {
    "WEATHER_API_KEY": {
        "description": "Weather API key for weather lookup",
        "prompt": "Weather API key",
        "url": "https://weatherapi.com/",
        "tools": ["weather"],
        "password": True,
    },
}
```

## 清单

- [ ] 新建工具文件，包含 handler、schema、check function 和注册调用
- [ ] 在 `toolsets.py` 中加入对应 toolset
- [ ] 在 `model_tools.py` 中加入模块发现项
- [ ] 确认 handler 返回 JSON 字符串，错误使用 `{"error": "..."}`
- [ ] 如需 API key，把变量加入 `OPTIONAL_ENV_VARS`
- [ ] 如需批处理支持，检查 `toolset_distributions.py`
- [ ] 通过 `hermes chat -q "Use the weather tool for London"` 做一次实际验证
