---
title: "委派与并行工作"
description: "何时以及如何使用子 agent 委派，涵盖并行调研、代码审查和多文件协作等模式"
---

# 委派与并行工作

Hermes 可以启动彼此隔离的子 Agent，并让它们并行处理任务。每个子 Agent 都有自己的会话、终端环境和工具集。返回给主 Agent 的只有最终摘要，中间的工具调用过程不会进入你的上下文窗口。

完整功能说明见 [Subagent Delegation](/docs/user-guide/features/delegation)。

---

## 什么时候适合委派

**适合委派的场景：**
- 推理密度较高的子任务，例如调试、代码审查、研究总结
- 中间过程数据很多，容易把主上下文撑爆的任务
- 可以独立并行推进的多个工作流，例如同时研究 A 和 B
- 你想让 Agent 在“无预设偏见”的全新上下文中重新看问题

**下面这些情况更适合别的方法：**
- 只需要一次工具调用：直接调用工具即可
- 机械性的多步操作，中间还需要明确逻辑衔接：用 `execute_code`
- 需要用户交互的任务：子 Agent 不能使用 `clarify`
- 很快就能做完的文件改动：直接自己处理更高效

---

## 模式一：并行调研

同时研究三个主题，并把结构化结论拿回来：

```
Research these three topics in parallel:
1. Current state of WebAssembly outside the browser
2. RISC-V server chip adoption in 2025
3. Practical quantum computing applications

Focus on recent developments and key players.
```

在底层，Hermes 实际上会执行类似这样的调用：

```python
delegate_task(tasks=[
    {
        "goal": "Research WebAssembly outside the browser in 2025",
        "context": "Focus on: runtimes (Wasmtime, Wasmer), cloud/edge use cases, WASI progress",
        "toolsets": ["web"]
    },
    {
        "goal": "Research RISC-V server chip adoption",
        "context": "Focus on: server chips shipping, cloud providers adopting, software ecosystem",
        "toolsets": ["web"]
    },
    {
        "goal": "Research practical quantum computing applications",
        "context": "Focus on: error correction breakthroughs, real-world use cases, key companies",
        "toolsets": ["web"]
    }
])
```

三个子任务会并发执行。每个子 Agent 都会独立搜索网页并返回摘要，随后父 Agent 再把它们整合成一份完整简报。

---

## 模式二：代码审查

把安全审查委派给一个“空白上下文”的子 Agent，让它不带已有假设地重新审视代码：

```
Review the authentication module at src/auth/ for security issues.
Check for SQL injection, JWT validation problems, password handling,
and session management. Fix anything you find and run the tests.
```

这里的关键是 `context` 字段。它必须包含子 Agent 完成工作所需的全部信息：

```python
delegate_task(
    goal="Review src/auth/ for security issues and fix any found",
    context="""Project at /home/user/webapp. Python 3.11, Flask, PyJWT, bcrypt.
    Auth files: src/auth/login.py, src/auth/jwt.py, src/auth/middleware.py
    Test command: pytest tests/auth/ -v
    Focus on: SQL injection, JWT validation, password hashing, session management.
    Fix issues found and verify tests pass.""",
    toolsets=["terminal", "file"]
)
```

:::warning 上下文问题
子 Agent 对你当前会话中的内容**一无所知**。它是从零开始的。如果你只说“修复我们刚才讨论的那个 bug”，子 Agent 根本不知道你在指哪个 bug。文件路径、错误信息、项目结构和约束条件都要明确传进去。
:::

---

## 模式三：并行比较方案

可以让多个子 Agent 同时评估同一个问题的不同解法，再由主 Agent 做最终比较：

```
I need to add full-text search to our Django app. Evaluate three approaches
in parallel:
1. PostgreSQL tsvector (built-in)
2. Elasticsearch via django-elasticsearch-dsl
3. Meilisearch via meilisearch-python

For each: setup complexity, query capabilities, resource requirements,
and maintenance overhead. Compare them and recommend one.
```

每个子 Agent 只负责研究其中一种方案。因为它们相互隔离，所以不会互相污染判断。主 Agent 最终拿到三份独立结论后，再做推荐。

---

## 模式四：多文件重构

把一个大型重构任务拆成多个并行子任务，每个子 Agent 负责代码库中的不同部分：

```python
delegate_task(tasks=[
    {
        "goal": "Refactor all API endpoint handlers to use the new response format",
        "context": """Project at /home/user/api-server.
        Files: src/handlers/users.py, src/handlers/auth.py, src/handlers/billing.py
        Old format: return {"data": result, "status": "ok"}
        New format: return APIResponse(data=result, status=200).to_dict()
        Import: from src.responses import APIResponse
        Run tests after: pytest tests/handlers/ -v""",
        "toolsets": ["terminal", "file"]
    },
    {
        "goal": "Update all client SDK methods to handle the new response format",
        "context": """Project at /home/user/api-server.
        Files: sdk/python/client.py, sdk/python/models.py
        Old parsing: result = response.json()["data"]
        New parsing: result = response.json()["data"] (same key, but add status code checking)
        Also update sdk/python/tests/test_client.py""",
        "toolsets": ["terminal", "file"]
    },
    {
        "goal": "Update API documentation to reflect the new response format",
        "context": """Project at /home/user/api-server.
        Docs at: docs/api/. Format: Markdown with code examples.
        Update all response examples from old format to new format.
        Add a 'Response Format' section to docs/api/overview.md explaining the schema.""",
        "toolsets": ["terminal", "file"]
    }
])
```

:::tip
每个子 Agent 都有自己的终端会话。只要它们修改的是不同文件，就可以在同一个项目目录中并行工作而不互相踩踏。如果两个子 Agent 可能改到同一个文件，那更稳妥的做法是等并行阶段结束后由你自己统一处理那个文件。
:::

---

## 模式五：先收集，再分析

先用 `execute_code` 做机械性数据收集，再把推理密度高的分析工作委派出去：

```python
# Step 1: Mechanical gathering (execute_code is better here — no reasoning needed)
execute_code("""
from hermes_tools import web_search, web_extract

results = []
for query in ["AI funding Q1 2026", "AI startup acquisitions 2026", "AI IPOs 2026"]:
    r = web_search(query, limit=5)
    for item in r["data"]["web"]:
        results.append({"title": item["title"], "url": item["url"], "desc": item["description"]})

# Extract full content from top 5 most relevant
urls = [r["url"] for r in results[:5]]
content = web_extract(urls)

# Save for the analysis step
import json
with open("/tmp/ai-funding-data.json", "w") as f:
    json.dump({"search_results": results, "extracted": content["results"]}, f)
print(f"Collected {len(results)} results, extracted {len(content['results'])} pages")
""")

# Step 2: Reasoning-heavy analysis (delegation is better here)
delegate_task(
    goal="Analyze AI funding data and write a market report",
    context="""Raw data at /tmp/ai-funding-data.json contains search results and
    extracted web pages about AI funding, acquisitions, and IPOs in Q1 2026.
    Write a structured market report: key deals, trends, notable players,
    and outlook. Focus on deals over $100M.""",
    toolsets=["terminal", "file"]
)
```

这通常是最高效的模式：`execute_code` 负责低成本地完成 10 步以上的顺序工具调用，再让子 Agent 在干净上下文中完成那一次真正昂贵的推理任务。

---

## 如何选择 Toolset

根据子 Agent 的实际需求选择工具集：

| 任务类型 | Toolsets | 原因 |
|-----------|----------|-----|
| 网页调研 | `["web"]` | 只需要 `web_search` 和 `web_extract` |
| 代码工作 | `["terminal", "file"]` | 需要 shell 权限和文件操作 |
| 全栈任务 | `["terminal", "file", "web"]` | 除消息功能外几乎全开 |
| 只读分析 | `["file"]` | 只能读文件，不能跑 shell |

限制 toolset 可以让子 Agent 更专注，也能减少意外副作用，例如调研型子 Agent 不该顺手去运行 shell 命令。

---

## 约束条件

- **最多 3 个并行任务**：每一批最多只能同时启动 3 个子 Agent
- **不支持嵌套委派**：子 Agent 不能再调用 `delegate_task`、`clarify`、`memory`、`send_message` 或 `execute_code`
- **终端彼此独立**：每个子 Agent 都有独立终端会话、独立工作目录和独立状态
- **没有会话历史**：子 Agent 只能看到你在 `goal` 和 `context` 里传进去的内容
- **默认最多 50 次迭代**：简单任务可以主动把 `max_iterations` 调低，节省成本

---

## 使用建议

**目标要写具体。** “修 bug” 太笼统了；“修复 `api/handlers.py` 第 47 行 `process_request()` 从 `parse_body()` 收到 `None` 的 TypeError”才足够明确。

**把文件路径写进去。** 子 Agent 不知道你的项目结构。始终给出相关文件的绝对路径、项目根目录，以及测试命令。

**把委派当作上下文隔离工具。** 有时你想要一个全新的视角。强迫自己把问题讲清楚，再交给子 Agent，往往能得到更干净的判断。

**自己复核结果。** 子 Agent 返回的是摘要，而不是绝对真相。如果它说“我已经修好了，测试也通过了”，最好还是自己再跑一次测试，或者看一遍 diff。

---

*完整的 delegation 参考，包括所有参数、ACP 集成和高级配置，请见 [Subagent Delegation](/docs/user-guide/features/delegation)。*
