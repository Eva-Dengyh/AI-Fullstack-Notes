---
title: "子 Agent 委托"
description: "用 delegate_task 生成隔离上下文的子 Agent 以进行并行工作流"
---

# 子 Agent 委托

`delegate_task` 工具生成带隔离上下文、受限工具集和独立终端会话的子 AIAgent 实例。每个子获得新的对话并独立工作 — 仅其最终摘要进入父的上下文。

## 单个任务

```python
delegate_task(
    goal="调试为何测试失败",
    context="错误：test_foo.py 第 42 行的断言",
    toolsets=["terminal", "file"]
)
```

## 并行批处理

最多 3 个并发子 Agent：

```python
delegate_task(tasks=[
    {"goal": "研究话题 A", "toolsets": ["web"]},
    {"goal": "研究话题 B", "toolsets": ["web"]},
    {"goal": "修复构建", "toolsets": ["terminal", "file"]}
])
```

## 子 Agent 上下文如何工作

:::warning 关键：子 Agent 一无所知
子 Agent 从**完全新的对话**开始。它们对父的对话历史、先前工具调用或委托前讨论的任何内容零知识。子 Agent 的唯一上下文来自 `goal` 和 `context` 字段你提供。
:::

这意味着你必须传递**所有**子 Agent 需要的东西：

```python
# 坏的 - 子 Agent 不知道"错误"是什么
delegate_task(goal="修复错误")

# 好的 - 子 Agent 有它需要的所有上下文
delegate_task(
    goal="修复 api/handlers.py 中的 TypeError",
    context="""api/handlers.py 文件在第 47 行有 TypeError：
    'NoneType' 对象没有属性 'get'。
    process_request() 函数从 parse_body() 接收 dict，
    但当 Content-Type 缺失时 parse_body() 返回 None。
    项目在 /home/user/myproject 并使用 Python 3.11。"""
)
```

子 Agent 接收从你的目标和上下文构建的专注系统提示，指示它完成任务并提供关于它所做内容、发现内容、任何修改文件和任何遇到问题的结构摘要。

## 实际示例

### 并行研究

同时研究多个主题并收集摘要：

```python
delegate_task(tasks=[
    {
        "goal": "研究 2025 年 WebAssembly 的当前状态",
        "context": "关注：浏览器支持、非浏览器运行时、语言支持",
        "toolsets": ["web"]
    },
    {
        "goal": "研究 2025 年 RISC-V 采用的当前状态",
        "context": "关注：服务器芯片、嵌入系统、软件生态系统",
        "toolsets": ["web"]
    },
    {
        "goal": "研究 2025 年量子计算进展",
        "context": "关注：错误纠正突破、实际应用、关键参与者",
        "toolsets": ["web"]
    }
])
```

### 代码审查 + 修复

委托审查和修复工作流到新上下文：

```python
delegate_task(
    goal="审查身份验证模块查找安全问题并修复任何发现",
    context="""项目在 /home/user/webapp。
    认证模块文件：src/auth/login.py、src/auth/jwt.py、src/auth/middleware.py。
    项目使用 Flask、PyJWT 和 bcrypt。
    关注：SQL 注入、JWT 验证、密码处理、会话管理。
    修复任何发现的问题并运行测试套件（pytest tests/auth/）。""",
    toolsets=["terminal", "file"]
)
```

### 多文件重构

委托大重构任务，会淹没父上下文：

```python
delegate_task(
    goal="重构 src/ 中的所有 Python 文件以用适当日志记录替换 print()",
    context="""项目在 /home/user/myproject。
    使用 'logging' 模块，带 logger = logging.getLogger(__name__)。
    用适当日志级别替换 print() 调用：
    - print(f"Error: ...") -> logger.error(...)
    - print(f"Warning: ...") -> logger.warning(...)
    - print(f"Debug: ...") -> logger.debug(...)
    - 其他 print -> logger.info(...)
    不改变测试文件或 CLI 输出中的 print()。
    完成后运行 pytest 验证没有破坏。""",
    toolsets=["terminal", "file"]
)
```

## 批处理模式详情

当你提供 `tasks` 数组时，子 Agent 使用**线程池**并行运行：

- **最大并发**：3 个任务（如果更长，`tasks` 数组被截断到 3）
- **线程池**：使用 `MAX_CONCURRENT_CHILDREN = 3` 工作者的 `ThreadPoolExecutor`
- **进度显示**：在 CLI 模式中，树视图显示来自每个子 Agent 的工具调用，实时进行，带逐任务完成行。在网关模式中，进度被批处理并中继到父的进度回调
- **结果排序**：结果按任务索引排序以匹配输入顺序不管完成顺序
- **中断传播**：中断父（例如，发送新消息）中断所有活跃子

单任务委托无线程池开销地直接运行。

## 模型覆盖

你可通过 `config.yaml` 为子 Agent 配置不同模型 — 用于委托简单任务到更便宜/更快模型很有用：

```yaml
# 在 ~/.hermes/config.yaml
delegation:
  model: "google/gemini-flash-2.0"    # 子 Agent 的更便宜模型
  provider: "openrouter"              # 可选：路由子 Agent 到不同提供商
```

如果省略，子 Agent 使用与父相同的模型。

## 工具集选择提示

`toolsets` 参数控制子 Agent 有哪些工具访问。基于任务选择：

| 工具集模式 | 用途 |
|--------|----------|
| `["terminal", "file"]` | 代码工作、调试、文件编辑、构建 |
| `["web"]` | 研究、事实核查、文档查找 |
| `["terminal", "file", "web"]` | 全栈任务（默认） |
| `["file"]` | 只读分析、无执行的代码审查 |
| `["terminal"]` | 系统管理、进程管理 |

某些工具集不管你指定什么都**始终被阻止**，用于子 Agent：
- `delegation` — 无递归委托（防止无限生成）
- `clarify` — 子 Agent 无法与用户交互
- `memory` — 无共享持久内存写
- `code_execution` — 子应逐步推理
- `send_message` — 无跨平台副作用（例如，发送 Telegram 消息）

## 最大迭代

每个子 Agent 有迭代限制（默认：50）控制它能取多少工具调用转向：

```python
delegate_task(
    goal="快速文件检查",
    context="检查 /etc/nginx/nginx.conf 是否存在并打印其前 10 行",
    max_iterations=10  # 简单任务，不需要多转
)
```

## 深度限制

委托有**2 的深度限制** — 父（深度 0）可生成子（深度 1），但子无法进一步委托。这防止失控递归委托链。

## 关键属性

- 每个子 Agent 获得其**自己的终端会话**（与父分离）
- **无嵌套委托** — 子无法进一步委托（无孙）
- 子 Agent **不能**调用：`delegate_task`、`clarify`、`memory`、`send_message`、`execute_code`
- **中断传播** — 中断父中断所有活跃子
- 仅最终摘要进入父上下文，保持令牌使用高效
- 子 Agent 继承父的 **API 密钥、提供商配置和凭证池**（启用速率限制上的密钥轮换）

## 委托 vs execute_code

| 因素 | delegate_task | execute_code |
|--------|--------------|-------------|
| **推理** | 完整 LLM 推理循环 | 仅 Python 代码执行 |
| **上下文** | 新隔离对话 | 无对话，仅脚本 |
| **工具访问** | 所有非阻止工具有推理 | 通过 RPC 7 工具，无推理 |
| **并行性** | 最多 3 并发子 Agent | 单个脚本 |
| **最佳用于** | 需要判断的复杂任务 | 机械多步管道 |
| **令牌成本** | 更高（完整 LLM 循环） | 更低（仅返回 stdout） |
| **用户交互** | 无（子 Agent 无法澄清） | 无 |

**经验法则：** 当子任务需要推理、判断或多步问题解决时使用 `delegate_task`。当你需要机械数据处理或脚本工作流时使用 `execute_code`。

## 配置

```yaml
# 在 ~/.hermes/config.yaml
delegation:
  max_iterations: 50                        # 每子最大转向（默认：50）
  default_toolsets: ["terminal", "file", "web"]  # 默认工具集
  model: "google/gemini-3-flash-preview"             # 可选提供商/模型覆盖
  provider: "openrouter"                             # 可选内置提供商

# 或使用直接自定义端点而非提供商：
delegation:
  model: "qwen2.5-coder"
  base_url: "http://localhost:1234/v1"
  api_key: "local-key"
```

:::tip
Agent 基于任务复杂性自动处理委托。你无需显式要求它委托 — 当有意义时它会这样做。
:::
