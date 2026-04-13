---
sidebar_position: 7
title: "在 Hermes 中使用 SOUL.md"
description: "如何使用 SOUL.md 塑造 Hermes Agent 的默认风格、哪些内容适合放进去，以及它与 AGENTS.md 和 /personality 的区别"
---

# 在 Hermes 中使用 SOUL.md

`SOUL.md` 是你这个 Hermes 实例的**核心身份文件**。它位于 system prompt 的最前面，用来定义 Agent 是谁、说话方式是什么、以及它在风格上会刻意避免什么。

如果你希望每次和 Hermes 对话时，它都像同一个助手；或者你想完全用自己的 persona 替换 Hermes 的默认人格，那么就应该用这个文件。

## SOUL.md 适合放什么

把下面这些内容放进 `SOUL.md`：
- 语气
- 人格
- 沟通风格
- Hermes 应该更直接还是更温和
- Hermes 在表达上应该避免什么
- Hermes 应该如何面对不确定性、分歧和模糊空间

一句话概括：
- `SOUL.md` 关注的是 Hermes 是谁，以及 Hermes 怎么说话

## SOUL.md 不适合放什么

不要把这些内容放进去：
- 仓库特定的编码规范
- 文件路径
- 命令
- 服务端口
- 架构备注
- 项目流程说明

这些应该写进 `AGENTS.md`。

一个简单规则：
- 如果它应该在所有场景下都生效，就放进 `SOUL.md`
- 如果它只属于某一个项目，就放进 `AGENTS.md`

## 文件放在哪里

Hermes 现在只使用当前实例的全局 SOUL 文件：

```text
~/.hermes/SOUL.md
```

如果你运行 Hermes 时使用了自定义 home 目录，那么路径会变成：

```text
$HERMES_HOME/SOUL.md
```

## 首次运行时的行为

如果系统中还没有 `SOUL.md`，Hermes 会自动为你生成一个起始版本。

这意味着大多数用户现在一开始就能拿到一个真实存在、可以立刻阅读和修改的文件。

需要注意的是：
- 如果你已经有 `SOUL.md`，Hermes 不会覆盖它
- 如果文件存在但内容为空，Hermes 不会从中向 prompt 添加任何内容

## Hermes 是如何使用它的

当 Hermes 启动一个新会话时，它会从 `HERMES_HOME` 读取 `SOUL.md`，扫描是否存在 prompt injection 模式，必要时进行截断，然后把它作为**Agent 身份描述**使用，也就是 system prompt 的第 1 号槽位。这意味着 SOUL.md 会完整替换内置的默认身份文本。

如果 `SOUL.md` 缺失、为空，或者无法加载，Hermes 就会回退到内置默认身份。

系统不会额外在文件外层包一层解释性语言。真正起作用的就是文件内容本身，所以你应该直接按你希望 Agent 思考和表达的方式去写。

## 一个很好的第一步修改

如果你暂时不想大动，只需要打开文件，改几行，让它更像你想要的样子。

例如：

```markdown
You are direct, calm, and technically precise.
Prefer substance over politeness theater.
Push back clearly when an idea is weak.
Keep answers compact unless deeper detail is useful.
```

光是这些内容，就足以明显改变 Hermes 的整体气质。

## 风格示例

### 1. 务实工程师

```markdown
You are a pragmatic senior engineer.
You care more about correctness and operational reality than sounding impressive.

## Style
- Be direct
- Be concise unless complexity requires depth
- Say when something is a bad idea
- Prefer practical tradeoffs over idealized abstractions

## Avoid
- Sycophancy
- Hype language
- Overexplaining obvious things
```

### 2. 研究搭档

```markdown
You are a thoughtful research collaborator.
You are curious, honest about uncertainty, and excited by unusual ideas.

## Style
- Explore possibilities without pretending certainty
- Distinguish speculation from evidence
- Ask clarifying questions when the idea space is underspecified
- Prefer conceptual depth over shallow completeness
```

### 3. 教师 / 讲解者

```markdown
You are a patient technical teacher.
You care about understanding, not performance.

## Style
- Explain clearly
- Use examples when they help
- Do not assume prior knowledge unless the user signals it
- Build from intuition to details
```

### 4. 严格审稿人

```markdown
You are a rigorous reviewer.
You are fair, but you do not soften important criticism.

## Style
- Point out weak assumptions directly
- Prioritize correctness over harmony
- Be explicit about risks and tradeoffs
- Prefer blunt clarity to vague diplomacy
```

## 什么样的 SOUL.md 才算强

一个好的 `SOUL.md` 应该是：
- 稳定的
- 普适的
- 风格明确的
- 不被临时性指令塞满的

一个不够好的 `SOUL.md` 往往是：
- 塞满项目细节
- 自相矛盾
- 试图微操每一种回答格式
- 大量堆砌类似“要有帮助”“要清晰”这种泛泛而谈的内容

Hermes 本身已经会努力做到有帮助和清晰。`SOUL.md` 应该增加真正的人格和风格，而不是重复默认能力。

## 推荐结构

你并不一定需要标题，但加上标题通常更清晰。

下面这种结构很好用：

```markdown
# Identity
Who Hermes is.

# Style
How Hermes should sound.

# Avoid
What Hermes should not do.

# Defaults
How Hermes should behave when ambiguity appears.
```

## SOUL.md 和 /personality 的区别

它们是互补关系。

把 `SOUL.md` 用作长期稳定的基线人格。
把 `/personality` 用作临时模式切换。

例如：
- 你的默认 SOUL 是务实、直接的
- 然后某一场会话里你切到 `/personality teacher`
- 之后你还可以切回去，而不必修改基础人格文件

## SOUL.md 和 AGENTS.md 的区别

这是最常见的混淆点。

### 这些应该放进 SOUL.md
- “表达要直接。”
- “避免夸张和营销式语言。”
- “除非深度有必要，否则优先简短回答。”
- “当用户错了时要明确指出。”

### 这些应该放进 AGENTS.md
- “用 pytest，不要用 unittest。”
- “前端代码在 `frontend/`。”
- “永远不要直接改 migration。”
- “API 跑在 8000 端口。”

## 如何编辑

```bash
nano ~/.hermes/SOUL.md
```

或者：

```bash
vim ~/.hermes/SOUL.md
```

然后重启 Hermes，或者直接开启一个新会话。

## 一个实用的调整流程

1. 从 Hermes 自动生成的默认文件开始
2. 删掉那些不符合你预期语气的部分
3. 添加 4 到 8 行，明确写出语气和默认行为
4. 和 Hermes 聊一阵
5. 根据你仍然觉得不对劲的地方继续调整

这种迭代方式通常比一开始就试图设计出“完美人格”更有效。

## 故障排查

### 我改了 SOUL.md，但 Hermes 听起来还是没变化

检查以下几点：
- 你编辑的是 `~/.hermes/SOUL.md` 或 `$HERMES_HOME/SOUL.md`
- 而不是某个仓库里的本地 `SOUL.md`
- 文件不是空的
- 修改后确实重启了会话
- 当前是否有 `/personality` 覆盖层压过了 SOUL 的效果

### Hermes 忽略了我 SOUL.md 的某些内容

可能原因包括：
- 有更高优先级的指令覆盖了它
- 文件内部存在互相冲突的指导
- 文件太长，被截断了
- 某些文本看起来像 prompt injection，被扫描器拦截或改写了

### 我的 SOUL.md 越写越像项目配置

把项目相关内容移到 `AGENTS.md`，让 `SOUL.md` 只专注于身份和风格。

## 相关文档

- [Personality & SOUL.md](/docs/user-guide/features/personality)
- [Context Files](/docs/user-guide/features/context-files)
- [Configuration](/docs/user-guide/configuration)
- [Tips & Best Practices](/docs/guides/tips)
