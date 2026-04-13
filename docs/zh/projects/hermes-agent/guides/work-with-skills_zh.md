---
title: "使用 Skills"
description: "查找、安装、使用和创建 skills，用按需知识让 Hermes 学会新的工作流"
---

# 使用 Skills

Skill 是一种按需加载的知识文档，用来教 Hermes 如何处理特定任务，从生成 ASCII 艺术字到管理 GitHub PR 都可以覆盖。这篇指南会带你了解日常该如何使用它们。

完整的技术参考见 [Skills System](/docs/user-guide/features/skills)。

---

## 查找 Skills

每个 Hermes 安装都会自带一些内置 skill。你可以这样查看：

```bash
# 在任意聊天会话中：
/skills

# 或者在 CLI 中：
hermes skills list
```

你会看到一个包含名称和描述的紧凑列表：

```
ascii-art         Generate ASCII art using pyfiglet, cowsay, boxes...
arxiv             Search and retrieve academic papers from arXiv...
github-pr-workflow Full PR lifecycle — create branches, commit...
plan              Plan mode — inspect context, write a markdown...
excalidraw        Create hand-drawn style diagrams using Excalidraw...
```

### 搜索 Skill

```bash
# 按关键字搜索
/skills search docker
/skills search music
```

### Skills Hub

官方可选 skill（通常更重或更偏门，默认不启用）可以通过 Hub 获取：

```bash
# 浏览官方可选 skill
/skills browse

# 搜索 Hub
/skills search blockchain
```

---

## 使用 Skill

每个已安装的 skill 都会自动成为一个斜杠命令。直接输入名字即可：

```bash
# 加载一个 skill，并直接给它任务
/ascii-art Make a banner that says "HELLO WORLD"
/plan Design a REST API for a todo app
/github-pr-workflow Create a PR for the auth refactor

# 只输入 skill 名，不带任务，也会加载 skill，然后让你继续描述需求
/excalidraw
```

你也可以在自然语言对话中明确要求 Hermes 使用某个 skill，它会通过 `skill_view` 工具把 skill 加载进来。

### 渐进式加载

Skill 使用了一种节省 token 的按需加载模式。Agent 不会一开始就把所有内容都读进来：

1. **`skills_list()`**：所有 skill 的紧凑列表（约 3k token），在会话开始时加载。
2. **`skill_view(name)`**：某一个 skill 的完整 `SKILL.md` 内容，当 Agent 判断需要它时才加载。
3. **`skill_view(name, file_path)`**：某个 skill 里的特定参考文件，只有在需要时才加载。

这意味着，只要 skill 没真正用上，就几乎不消耗额外 token。

---

## 从 Hub 安装

官方可选 skill 虽然随 Hermes 一起发布，但默认不会激活，需要你手动安装：

```bash
# 安装一个官方可选 skill
hermes skills install official/research/arxiv

# 在聊天会话里从 Hub 安装
/skills install official/creative/songwriting-and-ai-music
```

安装后会发生这些事：
1. skill 目录会被复制到 `~/.hermes/skills/`
2. 它会出现在 `skills_list` 输出中
3. 它会自动变成一个可用的斜杠命令

:::tip
已安装的 skill 会在**新会话**中生效。如果你想在当前会话立刻可用，可以用 `/reset` 重新开始，或者加 `--now` 来立刻让 prompt cache 失效（下一轮会更耗 token）。
:::

### 验证安装是否成功

```bash
# 检查是否存在
hermes skills list | grep arxiv

# 或者在聊天里
/skills search arxiv
```

---

## 配置 Skill 设置

有些 skill 会在 frontmatter 里声明它需要的配置：

```yaml
metadata:
  hermes:
    config:
      - key: tenor.api_key
        description: "Tenor API key for GIF search"
        prompt: "Enter your Tenor API key"
        url: "https://developers.google.com/tenor/guides/quickstart"
```

第一次加载这类 skill 时，Hermes 会提示你输入对应值。它们会保存在 `config.yaml` 的 `skills.config.*` 路径下。

你也可以在 CLI 中管理 skill 配置：

```bash
# 交互式配置某个 skill
hermes skills config gif-search

# 查看所有 skill 配置
hermes config get skills.config
```

---

## 创建自己的 Skill

Skill 本质上就是带有 YAML frontmatter 的 Markdown 文件。通常 5 分钟之内就能写好一个。

### 1. 创建目录

```bash
mkdir -p ~/.hermes/skills/my-category/my-skill
```

### 2. 编写 SKILL.md

```markdown title="~/.hermes/skills/my-category/my-skill/SKILL.md"
---
name: my-skill
description: Brief description of what this skill does
version: 1.0.0
metadata:
  hermes:
    tags: [my-tag, automation]
    category: my-category
---

# My Skill

## When to Use
Use this skill when the user asks about [specific topic] or needs to [specific task].

## Procedure
1. First, check if [prerequisite] is available
2. Run `command --with-flags`
3. Parse the output and present results

## Pitfalls
- Common failure: [description]. Fix: [solution]
- Watch out for [edge case]

## Verification
Run `check-command` to confirm the result is correct.
```

### 3. 添加参考文件（可选）

Skill 可以包含一些辅助文件，供 Agent 按需读取：

```
my-skill/
├── SKILL.md                    # 主 skill 文档
├── references/
│   ├── api-docs.md             # Agent 可查阅的 API 参考
│   └── examples.md             # 输入/输出示例
├── templates/
│   └── config.yaml             # Agent 可复用的模板文件
└── scripts/
    └── setup.sh                # Agent 可以执行的脚本
```

你可以在 `SKILL.md` 中这样引用它们：

```markdown
For API details, load the reference: `skill_view("my-skill", "references/api-docs.md")`
```

### 4. 测试

开启一个新会话，试试你的 skill：

```bash
hermes chat -q "/my-skill help me with the thing"
```

Skill 会自动出现，不需要额外注册。只要把它放进 `~/.hermes/skills/`，它就能立刻被发现。

:::info
Agent 自己也可以使用 `skill_manage` 来创建和更新 skill。它在解决复杂问题后，甚至可能主动提议把当前流程保存成一个 skill，方便下次复用。
:::

---

## 按平台管理 Skill

你可以控制不同平台能用哪些 skill：

```bash
hermes skills
```

这会打开一个交互式 TUI，你可以按平台（CLI、Telegram、Discord 等）启用或禁用 skill。比如你可能希望某些开发类 skill 不出现在 Telegram 上，这就很实用。

---

## Skills 和 Memory 的区别

它们都能跨会话持久存在，但作用完全不同：

| | Skills | Memory |
|---|---|---|
| **存的是什么** | 过程性知识：怎么做某件事 | 事实性知识：某些事实是什么 |
| **什么时候加载** | 按需加载，仅在相关时才读取 | 每次会话都会自动注入 |
| **体积** | 可以很大（几百行也行） | 应尽量精简，只保留关键事实 |
| **成本** | 不加载就不耗 token | 始终有少量固定 token 成本 |
| **示例** | “如何部署到 Kubernetes” | “用户偏好深色模式，所在时区是 PST” |
| **谁来创建** | 你、Agent，或从 Hub 安装 | 主要由 Agent 根据对话提炼 |

**经验法则：** 如果这段内容更像参考文档，那它应该是 skill；如果它更像便签纸上的提醒，那它应该是 memory。

---

## 使用建议

**让 skill 保持聚焦。** 一个试图覆盖“整个 DevOps”的 skill 往往会太长也太空泛；而“如何把 Python 应用部署到 Fly.io”就足够具体，真正有复用价值。

**让 Agent 帮你创建 skill。** 每次复杂的多步骤任务做完后，Hermes 往往会提出把流程保存为 skill。建议答应它，因为这种由 Agent 生成的 skill 往往能把中途发现的坑和关键步骤一并保存下来。

**善用分类。** 把 skill 按子目录组织，比如 `~/.hermes/skills/devops/`、`~/.hermes/skills/research/`。这样列表会更清晰，Agent 也更容易更快地找到相关内容。

**过期了就更新。** 如果某个 skill 在实际使用中遇到它没覆盖的问题，就让 Hermes 把新经验补进去。不维护的 skill 最终会成为负担。

---

*完整的 skills 参考，包括 frontmatter 字段、条件激活、外部目录等高级能力，请见 [Skills System](/docs/user-guide/features/skills)。*
