---
title: "技能系统"
description: "按需知识文档 — 渐进式披露、Agent 管理的技能和技能中心"
---

# 技能系统

技能是 Agent 按需加载的知识文档。它们遵循**渐进式披露**模式以最小化令牌使用，兼容 [agentskills.io](https://agentskills.io/specification) 开放标准。

所有技能都存储在 **`~/.hermes/skills/`** — 主要目录和真实来源。在新安装上，捆绑的技能从仓库复制。从中心安装和 Agent 创建的技能也放在这里。Agent 可以修改或删除任何技能。

你也可以指向 Hermes **外部技能目录** — 附加文件夹与本地文件夹一起扫描。参见下面的 [External Skill Directories](#external-skill-directories)。

另请参见：

- [Bundled Skills Catalog](/docs/reference/skills-catalog)
- [Official Optional Skills Catalog](/docs/reference/optional-skills-catalog)

## 使用技能

每个已安装的技能自动可用作斜杠命令：

```bash
# 在 CLI 或任何消息平台中：
/gif-search funny cats
/axolotl help me fine-tune Llama 3 on my dataset
/github-pr-workflow create a PR for the auth refactor
/plan design a rollout for migrating our auth provider

# 仅技能名称加载它并让 Agent 询问你需要什么：
/excalidraw
```

捆绑的 `plan` 技能是一个带自定义行为的技能支持的斜杠命令的好例子。运行 `/plan [request]` 告诉 Hermes 检查上下文（如需），写一个 markdown 实现计划而非执行任务，并将结果保存到相对于活跃工作区/后端工作目录的 `.hermes/plans/` 下。

你也可以通过自然对话与技能交互：

```bash
hermes chat --toolsets skills -q "What skills do you have?"
hermes chat --toolsets skills -q "Show me the axolotl skill"
```

## 渐进式披露

技能使用令牌高效加载模式：

```
Level 0: skills_list()           → [{name, description, category}, ...]   (~3k tokens)
Level 1: skill_view(name)        → 完整内容 + 元数据       (varies)
Level 2: skill_view(name, path)  → 特定参考文件       (varies)
```

Agent 仅在真正需要时加载完整的技能内容。

## SKILL.md 格式

```markdown
---
name: my-skill
description: 此技能的作用简要描述
version: 1.0.0
platforms: [macos, linux]     # 可选 — 限制到特定 OS 平台
metadata:
  hermes:
    tags: [python, automation]
    category: devops
    fallback_for_toolsets: [web]    # 可选 — 条件激活（见下文）
    requires_toolsets: [terminal]   # 可选 — 条件激活（见下文）
    config:                          # 可选 — config.yaml 设置
      - key: my.setting
        description: "这控制什么"
        default: "value"
        prompt: "设置提示"
---

# 技能标题

## 何时使用
此技能的触发条件。

## 步骤
1. 第一步
2. 第二步

## 陷阱
- 已知失败模式和修复

## 验证
如何确认它有效。
```

### 平台特定的技能

技能可以使用 `platforms` 字段限制自己到特定操作系统：

| 值 | 匹配 |
|-------|---------|
| `macos` | macOS (Darwin) |
| `linux` | Linux |
| `windows` | Windows |

```yaml
platforms: [macos]            # 仅 macOS（例如 iMessage、Apple Reminders、FindMy）
platforms: [macos, linux]     # macOS 和 Linux
```

当设置时，技能在不兼容平台上自动从系统提示、`skills_list()` 和斜杠命令中隐藏。如果省略，技能在所有平台上加载。

### 条件激活（回退技能）

技能可根据当前会话中可用的工具自动显示或隐藏自己。这对于**回退技能** — 应仅在高级工具不可用时出现的免费或本地替代品最有用。

```yaml
metadata:
  hermes:
    fallback_for_toolsets: [web]      # 仅当这些工具集不可用时显示
    requires_toolsets: [terminal]     # 仅当这些工具集可用时显示
    fallback_for_tools: [web_search]  # 仅当这些特定工具不可用时显示
    requires_tools: [terminal]        # 仅当这些特定工具可用时显示
```

| 字段 | 行为 |
|-------|----------|
| `fallback_for_toolsets` | 当列出的工具集可用时技能被**隐藏**。当它们丢失时显示。 |
| `fallback_for_tools` | 相同，但检查单个工具而非工具集。 |
| `requires_toolsets` | 当列出的工具集不可用时技能被**隐藏**。当它们存在时显示。 |
| `requires_tools` | 相同，但检查单个工具。 |

**示例：** 内置 `duckduckgo-search` 技能使用 `fallback_for_toolsets: [web]`。当你设置了 `FIRECRAWL_API_KEY` 时，web 工具集可用，Agent 使用 `web_search` — DuckDuckGo 技能保持隐藏。如果 API 密钥丢失，web 工具集不可用，DuckDuckGo 技能自动作为回退出现。

没有任何条件字段的技能表现如前 — 它们始终显示。

## 加载时安全设置

技能可声明所需环境变量而不会从发现中消失：

```yaml
required_environment_variables:
  - name: TENOR_API_KEY
    prompt: Tenor API key
    help: 从 https://developers.google.com/tenor 获取密钥
    required_for: full functionality
```

当遇到缺失值时，Hermes 仅在本地 CLI 中实际加载技能时才安全地询问。你可跳过设置并继续使用技能。消息表面绝不在聊天中要求秘密 — 它们告诉你在本地使用 `hermes setup` 或 `~/.hermes/.env` 代替。

一旦设置，声明的环境变量**自动传递** — 到 `execute_code` 和 `terminal` 沙箱中。技能的脚本可直接使用 `$TENOR_API_KEY`。对于非技能环境变量，使用 `terminal.env_passthrough` 配置选项。参见 [Environment Variable Passthrough](/docs/user-guide/security#environment-variable-passthrough) 了解详情。

### 技能配置设置

技能也可声明存储在 `config.yaml` 中的非秘密配置设置（路径、偏好）：

```yaml
metadata:
  hermes:
    config:
      - key: wiki.path
        description: wiki 目录路径
        default: "~/wiki"
        prompt: Wiki 目录路径
```

设置存储在 `config.yaml` 中的 `skills.config` 下。`hermes config migrate` 提示未配置的设置，`hermes config show` 显示它们。当技能加载时，其解析的配置值被注入到上下文中，以便 Agent 自动知道配置的值。

参见 [Skill Settings](/docs/user-guide/configuration#skill-settings) 和 [Creating Skills — Config Settings](/docs/developer-guide/creating-skills#config-settings-configyaml) 了解详情。

## 技能目录结构

```text
~/.hermes/skills/                  # 单一真实来源
├── mlops/                         # 类别目录
│   ├── axolotl/
│   │   ├── SKILL.md               # 主说明（必需）
│   │   ├── references/            # 附加文档
│   │   ├── templates/             # 输出格式
│   │   ├── scripts/               # 可从技能调用的辅助脚本
│   │   └── assets/                # 补充文件
│   └── vllm/
│       └── SKILL.md
├── devops/
│   └── deploy-k8s/                # Agent 创建的技能
│       ├── SKILL.md
│       └── references/
├── .hub/                          # 技能中心状态
│   ├── lock.json
│   ├── quarantine/
│   └── audit.log
└── .bundled_manifest              # 跟踪已播种的捆绑技能
```

## 外部技能目录

如果你在 Hermes 外部维护技能 — 例如，一个多个 AI 工具使用的共享 `~/.agents/skills/` 目录 — 你可以告诉 Hermes 也扫描那些目录。

在 `~/.hermes/config.yaml` 的 `skills` 部分下添加 `external_dirs`：

```yaml
skills:
  external_dirs:
    - ~/.agents/skills
    - /home/shared/team-skills
    - ${SKILLS_REPO}/skills
```

路径支持 `~` 展开和 `${VAR}` 环境变量替换。

### 工作原理

- **只读**：外部目录仅用于技能发现扫描。当 Agent 创建或编辑技能时，它总是写到 `~/.hermes/skills/`。
- **本地优先**：如果同一技能名称同时存在于本地目录和外部目录中，本地版本获胜。
- **完整集成**：外部技能出现在系统提示索引、`skills_list`、`skill_view` 和 `/skill-name` 斜杠命令中 — 与本地技能无异。
- **非存在路径被静默跳过**：如果配置的目录不存在，Hermes 无错误地忽略它。对于可能在每台计算机上不存在的可选共享目录很有用。

### 示例

```text
~/.hermes/skills/               # 本地（主要、读写）
├── devops/deploy-k8s/
│   └── SKILL.md
└── mlops/axolotl/
    └── SKILL.md

~/.agents/skills/               # 外部（只读、共享）
├── my-custom-workflow/
│   └── SKILL.md
└── team-conventions/
    └── SKILL.md
```

所有四个技能出现在你的技能索引中。如果本地创建一个称为 `my-custom-workflow` 的新技能，它会遮蔽外部版本。

## Agent 管理的技能（skill_manage 工具）

Agent 可通过 `skill_manage` 工具创建、更新和删除自己的技能。这是 Agent 的**程序记忆** — 当它想出一个非平凡的工作流时，它将该方法保存为一个技能供将来重用。

### 何时 Agent 创建技能

- 在成功完成复杂任务（5+ 工具调用）后
- 当它遇到错误或死路并找到了工作路径时
- 当用户纠正了它的方法时
- 当它发现了一个非平凡工作流时

### 操作

| 操作 | 用途 | 关键参数 |
|--------|---------|------------|
| `create` | 从零开始的新技能 | `name`, `content`（完整 SKILL.md）, 可选 `category` |
| `patch` | 有针对性的修复（首选） | `name`, `old_string`, `new_string` |
| `edit` | 主要结构重写 | `name`, `content`（完整 SKILL.md 替换） |
| `delete` | 完全删除技能 | `name` |
| `write_file` | 添加/更新支持文件 | `name`, `file_path`, `file_content` |
| `remove_file` | 删除支持文件 | `name`, `file_path` |

:::tip
`patch` 操作对于更新是首选 — 它比 `edit` 令牌更高效，因为仅更改的文本出现在工具调用中。
:::

## 技能中心

浏览、搜索、安装和管理来自在线注册表、`skills.sh`、直接已知技能端点和官方可选技能的技能。

### 常见命令

```bash
hermes skills browse                              # 浏览所有中心技能（官方优先）
hermes skills browse --source official            # 仅浏览官方可选技能
hermes skills search kubernetes                   # 搜索所有来源
hermes skills search react --source skills-sh     # 搜索 skills.sh 目录
hermes skills search https://mintlify.com/docs --source well-known
hermes skills inspect openai/skills/k8s           # 安装前预览
hermes skills install openai/skills/k8s           # 使用安全扫描安装
hermes skills install official/security/1password
hermes skills install skills-sh/vercel-labs/json-render/json-render-react --force
hermes skills install well-known:https://mintlify.com/docs/.well-known/skills/mintlify
hermes skills list --source hub                   # 列表中心安装的技能
hermes skills check                               # 检查已安装中心技能以获取上游更新
hermes skills update                              # 有更新时重新安装中心技能
hermes skills audit                               # 重新扫描所有中心技能以获得安全性
hermes skills uninstall k8s                       # 删除中心技能
hermes skills publish skills/my-skill --to github --repo owner/repo
hermes skills snapshot export setup.json          # 导出技能配置
hermes skills tap add myorg/skills-repo           # 添加自定义 GitHub 来源
```

### 支持的中心来源

| 来源 | 示例 | 说明 |
|--------|---------|-------|
| `official` | `official/security/1password` | 随 Hermes 发货的可选技能。 |
| `skills-sh` | `skills-sh/vercel-labs/agent-skills/vercel-react-best-practices` | 可通过 `hermes skills search <query> --source skills-sh` 搜索。Hermes 当 skills.sh slug 与仓库文件夹不同时解析别名风格技能。 |
| `well-known` | `well-known:https://mintlify.com/docs/.well-known/skills/mintlify` | 直接从网站的 `/.well-known/skills/index.json` 提供的技能。使用网站或文档 URL 搜索。 |
| `github` | `openai/skills/k8s` | 直接 GitHub 仓库/路径安装和自定义 tap。 |
| `clawhub`, `lobehub`, `claude-marketplace` | 来源特定标识符 | 社区或市场集成。 |

### 集成的中心和注册表

Hermes 目前与这些技能生态系统和发现来源集成：

#### 1. 官方可选技能（`official`）

这些在 Hermes 仓库本身中维护并用内置信任安装。

- 目录：[Official Optional Skills Catalog](../../reference/optional-skills-catalog)
- 仓库中的来源：`optional-skills/`
- 示例：

```bash
hermes skills browse --source official
hermes skills install official/security/1password
```

#### 2. skills.sh（`skills-sh`）

这是 Vercel 的公共技能目录。Hermes 可直接搜索它、检查技能详情页面、解析别名风格的 slug，并从基础来源仓库安装。

- 目录：[skills.sh](https://skills.sh/)
- CLI/工具仓库：[vercel-labs/skills](https://github.com/vercel-labs/skills)
- 官方 Vercel 技能仓库：[vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- 示例：

```bash
hermes skills search react --source skills-sh
hermes skills inspect skills-sh/vercel-labs/json-render/json-render-react
hermes skills install skills-sh/vercel-labs/json-render/json-render-react --force
```

#### 3. 已知技能端点（`well-known`）

这是来自发布 `/.well-known/skills/index.json` 的网站的基于 URL 的发现。它不是单一的集中中心 — 它是一个网络发现约定。

- 示例实时端点：[Mintlify 文档技能索引](https://mintlify.com/docs/.well-known/skills/index.json)
- 参考服务器实现：[vercel-labs/skills-handler](https://github.com/vercel-labs/skills-handler)
- 示例：

```bash
hermes skills search https://mintlify.com/docs --source well-known
hermes skills inspect well-known:https://mintlify.com/docs/.well-known/skills/mintlify
hermes skills install well-known:https://mintlify.com/docs/.well-known/skills/mintlify
```

#### 4. 直接 GitHub 技能（`github`）

Hermes 可直接从 GitHub 仓库和基于 GitHub 的 tap 安装。当你已经知道仓库/路径或想添加自己的自定义来源仓库时很有用。

默认 tap（可无任何设置浏览）：
- [openai/skills](https://github.com/openai/skills)
- [anthropics/skills](https://github.com/anthropics/skills)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [garrytan/gstack](https://github.com/garrytan/gstack)

- 示例：

```bash
hermes skills install openai/skills/k8s
hermes skills tap add myorg/skills-repo
```

#### 5. ClawHub（`clawhub`）

一个集成为社区来源的第三方技能市场。

- 网站：[clawhub.ai](https://clawhub.ai/)
- Hermes 来源 ID：`clawhub`

#### 6. Claude 市场风格仓库（`claude-marketplace`）

Hermes 支持发布 Claude 兼容插件/市场清单的市场仓库。

已知集成来源包括：
- [anthropics/skills](https://github.com/anthropics/skills)
- [aiskillstore/marketplace](https://github.com/aiskillstore/marketplace)

Hermes 来源 ID：`claude-marketplace`

#### 7. LobeHub（`lobehub`）

Hermes 可搜索和将 LobeHub 公开目录中的 Agent 条目转换成可安装的 Hermes 技能。

- 网站：[LobeHub](https://lobehub.com/)
- 公开 Agent 索引：[chat-agents.lobehub.com](https://chat-agents.lobehub.com/)
- 支持仓库：[lobehub/lobe-chat-agents](https://github.com/lobehub/lobe-chat-agents)
- Hermes 来源 ID：`lobehub`

### 安全扫描和 `--force`

所有中心安装的技能都通过**安全扫描仪**进行检查，其检查数据泄露、提示注入、破坏性命令、供应链信号和其他威胁。

`hermes skills inspect ...` 现在也显示上游元数据（如可用）：
- 仓库 URL
- skills.sh 详情页面 URL
- 安装命令
- 周安装数
- 上游安全审计状态
- 已知索引/端点 URL

当你审查了第三方技能并想覆盖非危险政策块时使用 `--force`：

```bash
hermes skills install skills-sh/anthropics/skills/pdf --force
```

重要行为：
- `--force` 可覆盖谨慎/警告风格发现的政策块。
- `--force` **不**覆盖 `dangerous` 扫描判定。
- 官方可选技能（`official/...`）被视为内置信任且不显示第三方警告面板。

### 信任级别

| 级别 | 来源 | 政策 |
|-------|--------|--------|
| `builtin` | 与 Hermes 一起发货 | 始终受信任 |
| `official` | 仓库中的 `optional-skills/` | 内置信任，无第三方警告 |
| `trusted` | 受信任的注册表/仓库如 `openai/skills`、`anthropics/skills` | 比社区来源更宽容的政策 |
| `community` | 其他所有内容（`skills.sh`、已知端点、自定义 GitHub 仓库、大多数市场） | 非危险发现可用 `--force` 覆盖；`dangerous` 判定保持阻止 |

### 更新生命周期

中心现在跟踪足够的来源以重新检查已安装技能的上游副本：

```bash
hermes skills check          # 报告哪些已安装中心技能上游改变
hermes skills update         # 仅重新安装有可用更新的技能
hermes skills update react   # 更新一个特定已安装的中心技能
```

这使用存储的来源标识符加上当前上游包内容哈希以检测漂移。

### 斜杠命令（聊天内部）

所有相同命令都与 `/skills` 一起工作：

```text
/skills browse
/skills search react --source skills-sh
/skills search https://mintlify.com/docs --source well-known
/skills inspect skills-sh/vercel-labs/json-render/json-render-react
/skills install openai/skills/skill-creator --force
/skills check
/skills update
/skills list
```

官方可选技能仍使用 `official/security/1password` 和 `official/migration/openclaw-migration` 等标识符。
