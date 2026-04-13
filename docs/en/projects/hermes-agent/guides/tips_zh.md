---
sidebar_position: 1
title: "技巧与最佳实践"
description: "帮助你更高效使用 Hermes Agent 的实用建议，包括提示词技巧、CLI 快捷方式、上下文文件、记忆、成本优化与安全性"
---

# 技巧与最佳实践

这是一份见效很快的实用技巧合集，可以让你立刻更高效地使用 Hermes Agent。每一节关注的侧重点不同，直接浏览标题，跳到你最关心的部分即可。

---

## 如何获得更好的结果

### 明确说出你想要什么

模糊的提示词只会得到模糊的结果。与其说“修复这段代码”，不如说“修复 `api/handlers.py` 第 47 行的 TypeError，`process_request()` 从 `parse_body()` 收到了 `None`”。你提供的上下文越充分，需要来回迭代的次数就越少。

### 一开始就把上下文给全

在请求开头就提供相关细节，比如文件路径、错误信息、期望行为。一次写清楚的消息，通常胜过三轮来回澄清。报错回溯也可以直接贴，Agent 能读懂。

### 把重复出现的要求写进上下文文件

如果你总是在重复同样的话，比如“用 tab 不要空格”“我们用 pytest”“API 在 `/api/v2`”，那就把它们写进 `AGENTS.md`。Agent 每次会话都会自动读取它，配置一次，后面就省心了。

### 让 Agent 自己用工具

不要试图手把手指定每一个步骤。与其说“打开 `tests/test_foo.py`，看第 42 行，然后……”，不如直接说“找到并修复失败的测试”。Agent 已经有文件搜索、终端访问和代码执行能力，应该让它自己探索、验证和迭代。

### 复杂流程优先考虑 Skill

在你写一大段提示词解释“应该怎么做”之前，先看看有没有现成的 skill。输入 `/skills` 可以浏览可用 skill，也可以直接调用，例如 `/axolotl` 或 `/github-pr-workflow`。

## CLI 进阶技巧

### 多行输入

按 **Alt+Enter**（或 **Ctrl+J**）可以插入换行而不发送消息。这样你就能先组织好多行提示词、粘贴代码块，或者把复杂需求写清楚，再统一发送。

### 粘贴检测

CLI 会自动检测多行粘贴。你直接贴一段代码或完整报错，它不会把每一行都当成单独消息发出去，而是会缓冲后作为一条消息整体发送。

### 中断并重定向

按一次 **Ctrl+C** 可以在 Agent 回复途中打断它，然后你可以立刻输入新的消息，把它引导到正确方向。2 秒内连续按两次 Ctrl+C 会强制退出。当 Agent 明显跑偏时，这个功能非常有用。

### 用 `-c` 恢复会话

如果你忘了上一轮聊到哪了，可以运行 `hermes -c`，它会在完整保留历史的前提下恢复上一会话。你也可以按标题恢复：`hermes -r "my research project"`。

### 从剪贴板粘贴图片

按 **Ctrl+V** 可以直接把剪贴板中的图片贴进聊天。Agent 会使用视觉能力分析截图、图表、错误弹窗或 UI 草图，不需要你先手动保存成文件。

### 斜杠命令自动补全

输入 `/` 然后按 **Tab**，就能看到所有可用命令。这既包括内置命令（如 `/compress`、`/model`、`/title`），也包括你安装的全部 skill。你不需要死记硬背，Tab 补全会帮你完成。

:::tip
可以用 `/verbose` 在这些工具输出显示模式之间切换：**off → new → all → verbose**。想观察 Agent 在做什么时，`all` 很合适；只做简单问答时，`off` 最干净。
:::

## 上下文文件

### AGENTS.md：项目的大脑

在项目根目录创建一个 `AGENTS.md`，写入架构决策、编码规范和项目特定说明。它会在每次会话中自动注入，因此 Agent 始终知道这个项目应该遵守什么规则。

```markdown
# Project Context
- This is a FastAPI backend with SQLAlchemy ORM
- Always use async/await for database operations
- Tests go in tests/ and use pytest-asyncio
- Never commit .env files
```

### SOUL.md：定制人格与语气

如果你希望 Hermes 始终以稳定的“默认声音”说话，就编辑 `~/.hermes/SOUL.md`（如果你使用自定义 Hermes 主目录，则是 `$HERMES_HOME/SOUL.md`）。Hermes 现在会自动生成一个初始 SOUL，并将这个全局文件作为当前实例的人格来源。

完整说明见 [在 Hermes 中使用 SOUL.md](/docs/guides/use-soul-with-hermes)。

```markdown
# Soul
You are a senior backend engineer. Be terse and direct.
Skip explanations unless asked. Prefer one-liners over verbose solutions.
Always consider error handling and edge cases.
```

`SOUL.md` 用来放长期稳定的人格设定，`AGENTS.md` 用来放项目相关的工作指令。

### 兼容 `.cursorrules`

如果你已经有 `.cursorrules` 或 `.cursor/rules/*.mdc` 文件，Hermes 也会读取它们。你不需要重复整理一套编码规范，它会自动从当前工作目录加载这些规则。

### 发现机制

Hermes 会在会话开始时加载当前工作目录下顶层的 `AGENTS.md`。子目录中的 `AGENTS.md` 则是在工具调用过程中按需发现（通过 `subdirectory_hints.py`）并注入到工具结果中，而不是一开始就进入 system prompt。

:::tip
让上下文文件保持聚焦和简洁。因为它们会注入到每条消息中，每一个字符都会消耗 token 预算。
:::

## 记忆与 Skills

### Memory 和 Skill 应该怎么分

**Memory** 用来存“事实”：你的环境、偏好、项目位置，以及 Agent 关于你的长期认识。**Skill** 用来存“流程”：多步骤工作流、特定工具的使用说明，以及可复用的操作方法。简单说，memory 记录“是什么”，skill 记录“怎么做”。

### 什么时候值得创建 Skill

如果某个任务需要 5 步以上，而且你以后还会重复做，就值得把它做成 skill。你可以对 Agent 说：“把你刚才做的流程保存成一个叫 `deploy-staging` 的 skill。” 下次直接输入 `/deploy-staging`，Agent 就能加载整个步骤。

### 管理记忆容量

记忆容量是有意限制的（`MEMORY.md` 大约 2,200 字符，`USER.md` 大约 1,375 字符）。写满后，Agent 会自动合并条目。你也可以主动说“整理一下你的记忆”，或者“把旧的 Python 3.9 记录替换掉，我们现在用 3.12 了”。

### 让 Agent 帮你记住

一次高质量会话结束后，你可以说“把这个记下来，下次继续用”，Agent 会保存关键结论。你也可以说得更具体，例如：“记住我们的 CI 使用 GitHub Actions，工作流是 `deploy.yml`。”

:::warning
Memory 是一个冻结快照。会话中途写入的新记忆，不会立即出现在当前 system prompt 中，要等到下一次会话开始才会生效。Agent 会立刻写盘，但不会在会话中途刷新 prompt 缓存。
:::

## 性能与成本

### 不要破坏 Prompt Cache

大多数 LLM 提供商都会缓存 system prompt 的前缀。如果你保持 system prompt 稳定不变（上下文文件和 memory 不变），同一会话中的后续消息就更容易命中缓存，成本会显著更低。尽量避免在会话中途切模型或频繁修改 system prompt。

### 快到上限时用 `/compress`

长会话会不断累积 token。当你发现回复变慢或开始被截断时，运行 `/compress`。它会总结现有对话，保留关键上下文，同时大幅降低 token 消耗。你也可以用 `/usage` 查看当前消耗情况。

### 并行任务用 Delegation

如果你需要同时研究三个话题，可以要求 Agent 使用 `delegate_task` 并行拆分子任务。每个子 Agent 都有独立上下文，只有最终摘要会返回，这能显著减少主会话的 token 压力。

### 批量操作用 `execute_code`

不要一条一条运行终端命令。让 Agent 一次性写出能完成整批工作的脚本，通常更快也更省钱。比如，“写一个 Python 脚本，把所有 `.jpeg` 改名成 `.jpg` 并执行它”，通常比逐个重命名高效得多。

### 选对模型

用 `/model` 可以在会话中切换模型。复杂推理、架构设计这类任务适合前沿模型（Claude Sonnet/Opus、GPT-4o 等）；简单的格式调整、重命名或样板代码生成，则更适合切到更快的模型。

:::tip
可以定期运行 `/usage` 查看 token 使用情况；运行 `/insights` 可以看到过去 30 天更全面的使用趋势。
:::

## 消息平台使用建议

### 设置 Home Channel

在你常用的 Telegram 或 Discord 聊天里运行 `/sethome`，把它设为 home channel。Cron 任务结果和主动推送都会发到这里。如果不设，Agent 就没有地方发送这些消息。

### 用 `/title` 整理会话

用 `/title auth-refactor` 或 `/title research-llm-quantization` 给会话命名。命名后的会话可以用 `hermes sessions list` 快速找到，也能用 `hermes -r "auth-refactor"` 继续。未命名会话一多，很快就分不清谁是谁。

### 团队场景下用 DM Pairing

与其手动收集团队成员的用户 ID 加入 allowlist，不如启用 DM pairing。成员先私聊机器人，收到一次性配对码；你在服务器上执行 `hermes pairing approve telegram XKGH5N7P` 审批即可，简单而且安全。

### 调整工具进度显示模式

用 `/verbose` 控制你想看到多少工具执行细节。在消息平台里，通常“少一点更好”，所以建议用 `new`，只显示新增工具调用；在 CLI 里，`all` 则能让你实时看到 Agent 的完整动作。

:::tip
在消息平台上，会话会在空闲一段时间后自动重置（默认 24 小时），或者每天凌晨 4 点重置一次。若需要更长的会话周期，可以到 `~/.hermes/config.yaml` 里按平台调整。
:::

## 安全

### 处理不可信代码时使用 Docker

当你要处理不可信仓库，或运行不熟悉的代码时，建议把终端后端切到 Docker 或 Daytona。在 `.env` 中设置 `TERMINAL_BACKEND=docker`。这样即便执行破坏性命令，也只会影响容器，不会伤到主机系统。

```bash
# In your .env:
TERMINAL_BACKEND=docker
TERMINAL_DOCKER_IMAGE=hermes-sandbox:latest
```

### 避开 Windows 编码陷阱

在 Windows 上，一些默认编码（例如 `cp125x`）无法表示全部 Unicode 字符，可能会导致测试或脚本写文件时出现 `UnicodeEncodeError`。

- 最稳妥的做法是显式以 UTF-8 打开文件：

```python
with open("results.txt", "w", encoding="utf-8") as f:
    f.write("✓ All good\n")
```

- 在 PowerShell 中，你也可以把当前会话切到 UTF-8，用于控制台和原生命令输出：

```powershell
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
```

这样 PowerShell 和它启动的子进程都会统一使用 UTF-8，从而避免很多 Windows 特有的编码问题。

### 对 “Always” 选项保持谨慎

当 Agent 触发危险命令审批（例如 `rm -rf`、`DROP TABLE`）时，你通常会看到四个选项：**once**、**session**、**always**、**deny**。在选择 “always” 前要慎重，因为它会把这个模式永久加入白名单。更稳妥的做法是先选 “session”，确认没问题后再说。

### 命令审批是你的最后一道保险

Hermes 在执行命令前，会把命令和一组经过筛选的危险模式列表进行比对。这包括递归删除、SQL 删除表、把 curl 输出直接 pipe 给 shell 等行为。生产环境里不要关闭这套机制，它存在是有充分理由的。

:::warning
当终端后端运行在容器中（Docker、Singularity、Modal、Daytona）时，危险命令检查会被**跳过**，因为此时容器本身就是安全边界。请确保你的容器镜像本身是受控且收敛的。
:::

### 消息机器人一定要配合 Allowlist

如果机器人带有终端访问能力，就绝不要设置 `GATEWAY_ALLOW_ALL_USERS=true`。始终使用平台级 allowlist（如 `TELEGRAM_ALLOWED_USERS`、`DISCORD_ALLOWED_USERS`）或 DM pairing，来控制谁能与 Agent 交互。

```bash
# Recommended: explicit allowlists per platform
TELEGRAM_ALLOWED_USERS=123456789,987654321
DISCORD_ALLOWED_USERS=123456789012345678

# Or use cross-platform allowlist
GATEWAY_ALLOWED_USERS=123456789,987654321
```

---

*如果你觉得这页还缺少某条值得加入的技巧，欢迎提 issue 或 PR，社区贡献始终欢迎。*
