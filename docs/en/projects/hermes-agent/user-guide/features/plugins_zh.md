---
sidebar_position: 11
sidebar_label: "插件"
title: "插件"
description: "通过插件系统用自定义工具、hooks 和集成扩展 Hermes，不用修改核心代码"
---

# 插件

Hermes 有一个插件系统用于添加自定义工具、hooks 和集成而不修改核心代码。

**→ [构建一个 Hermes 插件](/docs/guides/build-a-hermes-plugin)** — 逐步指南与完整工作示例。

## 快速概览

将一个目录拖进 `~/.hermes/plugins/` 与一个 `plugin.yaml` 和 Python 代码：

```
~/.hermes/plugins/my-plugin/
├── plugin.yaml      # 清单
├── __init__.py      # register() — 连接 schemas 到处理器
├── schemas.py       # 工具 schemas（LLM 看什么）
└── tools.py         # 工具处理器（调用时运行什么）
```

启动 Hermes — 你的工具出现与内置工具一起。模型可以立即调用它们。

### 最小工作示例

这是一个完整的插件，添加一个 `hello_world` 工具和通过一个 hook 记录每个工具调用。

**`~/.hermes/plugins/hello-world/plugin.yaml`**

```yaml
name: hello-world
version: "1.0"
description: A minimal example plugin
```

**`~/.hermes/plugins/hello-world/__init__.py`**

```python
"""最小 Hermes 插件 — 注册一个工具和一个 hook。"""


def register(ctx):
    # --- 工具：hello_world ---
    schema = {
        "name": "hello_world",
        "description": "为给定名称返回友好问候。",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {
                    "type": "string",
                    "description": "要问候的名称",
                }
            },
            "required": ["name"],
        },
    }

    def handle_hello(params):
        name = params.get("name", "World")
        return f"Hello, {name}! 👋  (from the hello-world plugin)"

    ctx.register_tool("hello_world", schema, handle_hello)

    # --- Hook：记录每个工具调用 ---
    def on_tool_call(tool_name, params, result):
        print(f"[hello-world] tool called: {tool_name}")

    ctx.register_hook("post_tool_call", on_tool_call)
```

将两个文件拖进 `~/.hermes/plugins/hello-world/`，重启 Hermes，模型可以立即调用 `hello_world`。hook 在每个工具调用后打印一条日志行。

project 本地插件在 `./.hermes/plugins/` 下默认禁用。仅对受信仓库启用通过在 Hermes 启动前设置 `HERMES_ENABLE_PROJECT_PLUGINS=true`。

## 插件能做什么

| 能力 | 如何 |
|-----------|-----|
| 添加工具 | `ctx.register_tool(name, schema, handler)` |
| 添加 hooks | `ctx.register_hook("post_tool_call", callback)` |
| 添加 CLI 命令 | `ctx.register_cli_command(name, help, setup_fn, handler_fn)` — 添加 `hermes <plugin> <subcommand>` |
| 注入消息 | `ctx.inject_message(content, role="user")` — 见 [注入消息](#injecting-messages) |
| 装运数据文件 | `Path(__file__).parent / "data" / "file.yaml"` |
| 捆绑技能 | 复制 `skill.md` 到 `~/.hermes/skills/` 在加载时 |
| 在 env vars 上门 | `requires_env: [API_KEY]` 在 plugin.yaml — 在 `hermes plugins install` 期间提示 |
| 通过 pip 分布 | `[project.entry-points."hermes_agent.plugins"]` |

## 插件发现

| 源 | 路径 | 用例 |
|--------|------|----------|
| 用户 | `~/.hermes/plugins/` | 个人插件 |
| Project | `.hermes/plugins/` | Project 特定插件（需要 `HERMES_ENABLE_PROJECT_PLUGINS=true`） |
| pip | `hermes_agent.plugins` entry_points | 分布式包 |

## 可用 hooks

插件可以为这些生命周期事件注册回调。见 **[Event Hooks 页面](/docs/user-guide/features/hooks#plugin-hooks)** 了解完整详情、回调签名和示例。

| Hook | 何时触发 |
|------|-----------|
| [`pre_tool_call`](/docs/user-guide/features/hooks#pre_tool_call) | 任何工具执行之前 |
| [`post_tool_call`](/docs/user-guide/features/hooks#post_tool_call) | 任何工具返回后 |
| [`pre_llm_call`](/docs/user-guide/features/hooks#pre_llm_call) | 每轮一次，工具调用循环之前 — 可以返回 `{"context": "..."}` 到 [注入上下文到用户消息](/docs/user-guide/features/hooks#pre_llm_call) |
| [`post_llm_call`](/docs/user-guide/features/hooks#post_llm_call) | 每轮一次，工具调用循环后（仅成功轮次） |
| [`on_session_start`](/docs/user-guide/features/hooks#on_session_start) | 新会话创建（仅第一轮） |
| [`on_session_end`](/docs/user-guide/features/hooks#on_session_end) | 每个 `run_conversation` 调用 + CLI 退出处理器结束 |

## 插件类型

Hermes 有三种插件：

| 类型 | 它做什么 | 选择 | 位置 |
|------|-------------|-----------|----------|
| **一般插件** | 添加工具、hooks、CLI 命令 | 多选（启用/禁用） | `~/.hermes/plugins/` |
| **内存提供商** | 替换或增强内置内存 | 单选（一个活跃） | `plugins/memory/` |
| **上下文引擎** | 替换内置上下文压缩器 | 单选（一个活跃） | `plugins/context_engine/` |

内存提供商和上下文引擎是**提供商插件** — 一次只有一个每种类型能活跃。一般插件可以在任何组合中启用。

## 管理插件

```bash
hermes plugins                  # 统一交互式 UI
hermes plugins list             # 表格视图与启用/禁用状态
hermes plugins install user/repo  # 从 Git 安装
hermes plugins update my-plugin   # 拉最新
hermes plugins remove my-plugin   # 卸载
hermes plugins enable my-plugin   # 重新启用禁用的插件
hermes plugins disable my-plugin  # 禁用而不移除
```

### 交互式 UI

运行 `hermes plugins` 无参数打开一个复合交互式屏幕：

```
插件
  ↑↓ navigate  SPACE toggle  ENTER configure/confirm  ESC done

  一般插件
 → [✓] my-tool-plugin — Custom search tool
   [ ] webhook-notifier — Event hooks

  提供商插件
     内存提供商          ▸ honcho
     上下文引擎           ▸ compressor
```

- **一般插件部分** — 复选框，用 SPACE 切换
- **提供商插件部分** — 显示当前选择。按 ENTER 钻进一个单选选择器选你选择一个活跃提供商。

提供商插件选择保存到 `config.yaml`：

```yaml
memory:
  provider: "honcho"      # 空字符串 = 仅内置

context:
  engine: "compressor"    # 默认内置压缩器
```

### 禁用一般插件

禁用的插件保留已安装但在加载期间被跳过。禁用列表存储在 `config.yaml` 下 `plugins.disabled`：

```yaml
plugins:
  disabled:
    - my-noisy-plugin
```

在运行的会话中，`/plugins` 显示当前哪个插件被加载。

## 注入消息

插件可以使用 `ctx.inject_message()` 注入消息到活跃对话：

```python
ctx.inject_message("来自 webhook 的新数据", role="user")
```

**签名：** `ctx.inject_message(content: str, role: str = "user") -> bool`

工作原理：

- 如果 Agent 是**空闲**（等待用户输入），消息排队作为下一个输入并启动新轮。
- 如果 Agent 是**中途轮**（主动运行），消息中断当前操作 — 与用户输入新消息并按 Enter 相同。
- 对于非 `"user"` roles，内容前置 `[role]`（例如 `[system] ...`）。
- 返回 `True` 如果消息成功排队，`False` 如果无可用 CLI 引用（例如在网关模式中）。

这启用了插件，如远程控制查看器、消息传递桥接或 webhook 接收器，从外部源将消息馈进对话中。

:::note
`inject_message` 仅在 CLI 模式中可用。在网关模式中，没有 CLI 引用且方法返回 `False`。
:::

见**[完整指南](/docs/guides/build-a-hermes-plugin)**了解处理器契约、schema 格式、hook 行为、错误处理和常见错误。
