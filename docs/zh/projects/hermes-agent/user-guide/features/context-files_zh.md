---
title: "上下文文件"
description: "项目上下文文件 — .hermes.md、AGENTS.md、CLAUDE.md、全局 SOUL.md 和 .cursorrules — 自动注入每个对话"
---

# 上下文文件

Hermes Agent 自动发现并加载形成其行为方式的上下文文件。有些是项目本地的，从你的工作目录发现。`SOUL.md` 现在是全局的 Hermes 实例，仅从 `HERMES_HOME` 加载。

## 支持的上下文文件

| 文件 | 目的 | 发现 |
|------|---------|-----------|
| **.hermes.md** / **HERMES.md** | 项目说明（最高优先级） | 步行到 git 根 |
| **AGENTS.md** | 项目说明、约定、架构 | 启动时 CWD + 逐步子目录 |
| **CLAUDE.md** | Claude Code 上下文文件（也被检测） | 启动时 CWD + 逐步子目录 |
| **SOUL.md** | 此 Hermes 实例的全局个性和语调自定义 | 仅 `HERMES_HOME/SOUL.md` |
| **.cursorrules** | Cursor IDE 编码约定 | 仅 CWD |
| **.cursor/rules/*.mdc** | Cursor IDE 规则模块 | 仅 CWD |

:::info 优先级系统
每个会话仅加载**一个**项目上下文类型（首个匹配获胜）：`.hermes.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`。**SOUL.md** 始终独立加载作为 Agent 身份（插槽 #1）。
:::

## AGENTS.md

`AGENTS.md` 是主要的项目上下文文件。它告诉 Agent 你的项目是如何构造的、要遵循什么约定以及任何特殊说明。

### 渐进式子目录发现

在会话开始，Hermes 从你的工作目录加载 `AGENTS.md` 到系统提示。当 Agent 在会话期间导航到子目录时（通过 `read_file`、`terminal`、`search_files` 等），它**逐步发现**这些目录中的上下文文件，并在它们变得相关时将其注入到对话中。

```
my-project/
├── AGENTS.md              ← 在启动时加载（系统提示）
├── frontend/
│   └── AGENTS.md          ← 当 Agent 读 frontend/ 文件时发现
├── backend/
│   └── AGENTS.md          ← 当 Agent 读 backend/ 文件时发现
└── shared/
    └── AGENTS.md          ← 当 Agent 读 shared/ 文件时发现
```

这种方法相对于在启动时加载所有内容有两个优势：
- **无系统提示膨胀** — 子目录提示仅在需要时出现
- **提示缓存保留** — 系统提示在转向间保持稳定

每个子目录在每个会话中最多检查一次。发现也会步行父目录，所以读 `backend/src/main.py` 会发现 `backend/AGENTS.md`，即使 `backend/src/` 没有自己的上下文文件。

:::info
子目录上下文文件通过与启动上下文文件相同的 [security scan](#security-prompt-injection-protection) 进行。恶意文件被阻止。
:::

### AGENTS.md 示例

```markdown
# 项目上下文

这是一个 Next.js 14 网络应用，带有 Python FastAPI 后端。

## 架构
- 前端：`/frontend` 中带 App Router 的 Next.js 14
- 后端：`/backend` 中的 FastAPI，使用 SQLAlchemy ORM
- 数据库：PostgreSQL 16
- 部署：Docker Compose 在 Hetzner VPS 上

## 约定
- 为所有前端代码使用 TypeScript 严格模式
- Python 代码遵循 PEP 8，到处使用类型提示
- 所有 API 端点返回带 `{data, error, meta}` 形状的 JSON
- 测试放在 `__tests__/` 目录中（前端）或 `tests/`（后端）

## 重要笔记
- 永远不要直接修改迁移文件 — 使用 Alembic 命令
- `.env.local` 文件有真实 API 密钥，不要提交它
- 前端端口是 3000，后端 8000，DB 5432
```

## SOUL.md

`SOUL.md` 控制 Agent 的个性、语调和交流风格。参见 [Personality](/docs/user-guide/features/personality) 页面了解完整详情。

**位置：**

- `~/.hermes/SOUL.md`
- 或如果你以自定义主目录运行 Hermes，则 `$HERMES_HOME/SOUL.md`

重要详情：

- 如果不存在，Hermes 自动播种默认 `SOUL.md`
- Hermes 仅从 `HERMES_HOME` 加载 `SOUL.md`
- Hermes 不探查工作目录以查找 `SOUL.md`
- 如果文件为空，`SOUL.md` 中没有任何内容被添加到提示中
- 如果文件有内容，内容在扫描和截断后被逐字注入

## .cursorrules

Hermes 与 Cursor IDE 的 `.cursorrules` 文件和 `.cursor/rules/*.mdc` 规则模块兼容。如果这些文件存在于你的项目根目录中，且未找到更高优先级上下文文件（`.hermes.md`、`AGENTS.md` 或 `CLAUDE.md`），它们作为项目上下文加载。

这意味着你现有的 Cursor 约定在使用 Hermes 时自动应用。

## 上下文文件如何被加载

### 在启动时（系统提示）

上下文文件由 `agent/prompt_builder.py` 中的 `build_context_files_prompt()` 加载：

1. **扫描工作目录** — 检查 `.hermes.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`（首个匹配获胜）
2. **内容被读取** — 每个文件作为 UTF-8 文本读取
3. **安全扫描** — 内容被检查以查找提示注入模式
4. **截断** — 超过 20,000 字符的文件被头/尾截断（70% 头、20% 尾，中间带标记）
5. **组装** — 所有部分在 `# Project Context` 标题下组合
6. **注入** — 组装的内容被添加到系统提示

### 在会话期间（渐进发现）

`agent/subdirectory_hints.py` 中的 `SubdirectoryHintTracker` 监视工具调用参数中的文件路径：

1. **路径提取** — 在每个工具调用后，文件路径从参数中提取（`path`、`workdir`、shell 命令）
2. **祖先遍历** — 检查该目录和多达 5 个父目录（停在已访问目录）
3. **提示加载** — 如果找到 `AGENTS.md`、`CLAUDE.md` 或 `.cursorrules`，它被加载（首个匹配每个目录）
4. **安全扫描** — 与启动文件相同的提示注入扫描
5. **截断** — 每个文件上限 8,000 字符
6. **注入** — 附加到工具结果，使模型在上下文中自然看到它

最终提示部分看起来大致像：

```text
# 项目上下文

以下项目上下文文件已被加载，应被遵循：

## AGENTS.md

[你的 AGENTS.md 内容在这里]

## .cursorrules

[你的 .cursorrules 内容在这里]

[你的 SOUL.md 内容在这里]
```

注意 SOUL 内容直接插入，无额外包装文本。

## 安全：提示注入保护

所有上下文文件在包含前被扫描以查找潜在提示注入。扫描检查：

- **指令覆盖尝试**："忽略之前的指令"、"无视你的规则"
- **欺骗模式**："不要告诉用户"
- **系统提示覆盖**："系统提示覆盖"
- **隐藏 HTML 注释**：`<!-- ignore instructions -->`
- **隐藏 div 元素**：`<div style="display:none">`
- **凭证泄露**：`curl ... $API_KEY`
- **秘密文件访问**：`cat .env`、`cat credentials`
- **不可见字符**：零宽度空间、双向覆盖、词连接符

如果检测到任何威胁模式，文件被阻止：

```
[BLOCKED: AGENTS.md contained potential prompt injection (prompt_injection). Content not loaded.]
```

:::warning
此扫描器保护免受常见注入模式，但它不是审查共享仓库中上下文文件的替代品。总是验证你没有编写的项目中的 AGENTS.md 内容。
:::

## 大小限制

| 限制 | 值 |
|-------|-------|
| 每文件最大字符 | 20,000（~7,000 令牌） |
| 头截断比例 | 70% |
| 尾截断比例 | 20% |
| 截断标记 | 10%（显示字符计数并建议使用文件工具） |

当文件超过 20,000 字符时，截断消息读起来：

```
[...truncated AGENTS.md: kept 14000+4000 of 25000 chars. Use file tools to read the full file.]
```

## 有效上下文文件的提示

:::tip AGENTS.md 最佳做法
1. **保持简洁** — 保持在 20K 字符之下；Agent 每转都读它
2. **用标题结构** — 用 `##` 部分处理架构、约定、重要笔记
3. **包括具体示例** — 显示偏好代码模式、API 形状、命名约定
4. **提及不要做什么** — "永远不要直接修改迁移文件"
5. **列出关键路径和端口** — Agent 用这些进行终端命令
6. **随项目演进更新** — 过时上下文比没有上下文更坏
:::

### 按子目录的上下文

对于单体仓库，在嵌套 AGENTS.md 文件中放入子目录特定说明：

```markdown
<!-- frontend/AGENTS.md -->
# 前端上下文

- 用 `pnpm` 不是 `npm` 进行包管理
- 组件放在 `src/components/`，页面在 `src/app/`
- 使用 Tailwind CSS，永远不要使用内联样式
- 用 `pnpm test` 运行测试
```

```markdown
<!-- backend/AGENTS.md -->
# 后端上下文

- 用 `poetry` 进行依赖管理
- 用 `poetry run uvicorn main:app --reload` 运行开发服务器
- 所有端点需要 OpenAPI 文档字符串
- 数据库模型在 `models/`，schema 在 `schemas/`
```
