---
sidebar_position: 1
title: "CLI 界面"
description: "掌握 Hermes Agent 终端界面 — 命令、快捷键、人格设定等"
---

# CLI 界面

Hermes Agent 的 CLI 是一个完整的终端用户界面（TUI）——而非网页界面。它支持多行编辑、斜杠命令自动补全、对话历史、打断重定向以及流式工具输出。专为热爱终端的用户打造。

## 运行 CLI

```bash
# 启动交互式会话（默认）
hermes

# 单次查询模式（非交互式）
hermes chat -q "你好"

# 指定模型
hermes chat --model "anthropic/claude-sonnet-4"

# 指定 provider
hermes chat --provider nous        # 使用 Nous Portal
hermes chat --provider openrouter  # 强制使用 OpenRouter

# 指定工具集
hermes chat --toolsets "web,terminal,skills"

# 启动时预加载一个或多个技能
hermes -s hermes-agent-dev,github-auth
hermes chat -s github-pr-workflow -q "打开一个草稿 PR"

# 恢复之前的会话
hermes --continue             # 恢复最近的 CLI 会话 (-c)
hermes --resume <session_id>  # 按 ID 恢复特定会话 (-r)

# 详细模式（调试输出）
hermes chat --verbose

# 隔离的 git worktree（用于并行运行多个 agent）
hermes -w                         # 在 worktree 中交互模式
hermes -w -q "修复 issue #123"     # 在 worktree 中单次查询
```

## 界面布局

<img className="docs-terminal-figure" src="/img/docs/cli-layout.svg" alt="Hermes CLI 布局的示意图，展示横幅、对话区域和固定输入提示。" />
<p className="docs-figure-caption">Hermes CLI 横幅、对话流和固定输入提示，渲染为稳定的文档图形而非脆弱的 ASCII 艺术。</p>

欢迎横幅一目了然地显示您的模型、终端后端、工作目录、可用意具和已安装技能。

### 状态栏

输入区域上方有一个持久状态栏，实时更新：

```
 ⚕ claude-sonnet-4-20250514 │ 12.4K/200K │ [██████░░░░] 6% │ $0.06 │ 15m
```

| 元素 | 描述 |
|------|------|
| 模型名称 | 当前模型（超过 26 字符则截断） |
| Token 计数 | 已用上下文 token / 最大上下文窗口 |
| 上下文条 | 带颜色阈值指示的可视填充指示器 |
| 费用 | 估算会话费用（或未知/零价位型号的 `n/a`）|
| 时长 | 经过的会话时间 |

状态栏适应终端宽度——≥ 76 列时完整布局，52–75 列时紧凑，52 列以下仅显示模型和时长。

**上下文颜色编码：**

| 颜色 | 阈值 | 含义 |
|------|------|------|
| 绿色 | < 50% | 空间充裕 |
| 黄色 | 50–80% | 逐渐填满 |
| 橙色 | 80–95% | 接近上限 |
| 红色 | ≥ 95% | 即将溢出——考虑使用 `/compress` |

使用 `/usage` 获取详细费用明细（包括输入 vs 输出 token 的分类费用）。

### 会话恢复显示

恢复之前的会话时（`hermes -c` 或 `hermes --resume <id>`），横幅和输入提示之间会出现"之前的对话"面板，显示对话历史的简要回顾。详见 [会话——恢复时的对话回顾](sessions.md#conversation-recap-on-resume)。

## 快捷键

| 按键 | 操作 |
|------|------|
| `Enter` | 发送消息 |
| `Alt+Enter` 或 `Ctrl+J` | 新行（多行输入） |
| `Alt+V` | 当终端支持时，从剪贴板粘贴图片 |
| `Ctrl+V` | 粘贴文本并尽可能附加剪贴板图片 |
| `Ctrl+B` | 语音模式启用时开始/停止语音录制（`voice.record_key`，默认：`ctrl+b`）|
| `Ctrl+C` | 打断 agent（2 秒内双击强制退出）|
| `Ctrl+D` | 退出 |
| `Ctrl+Z` | 将 Hermes 挂起到后台（仅 Unix）。在 shell 中运行 `fg` 恢复。|
| `Tab` | 接受自动建议（幽灵文本）或自动补全斜杠命令 |

## 斜杠命令

输入 `/` 查看自动补全下拉菜单。Hermes 支持大量 CLI 斜杠命令、动态技能命令和用户定义的快速命令。

常见示例：

| 命令 | 描述 |
|------|------|
| `/help` | 显示命令帮助 |
| `/model` | 显示或切换当前模型 |
| `/tools` | 列出当前可用工具 |
| `/skills browse` | 浏览技能中心和官方可选技能 |
| `/background <prompt>` | 在独立后台会话中运行提示 |
| `/skin` | 显示或切换活动 CLI 皮肤 |
| `/voice on` | 启用 CLI 语音模式（按 `Ctrl+B` 录制）|
| `/voice tts` | 切换 Hermes 回复的语音播放 |
| `/reasoning high` | 提高推理投入 |
| `/title 我的会话` | 为当前会话命名 |

完整的内置 CLI 和消息传递列表，参见 [斜杠命令参考](../reference/slash-commands.md)。

关于设置、provider、静音调优和消息/Discord 语音使用，参见 [语音模式](features/voice-mode.md)。

:::tip
命令不区分大小写——`/HELP` 与 `/help` 效果相同。已安装的技能也会自动注册为斜杠命令。
:::

## 快速命令

您可以定义自定义命令，无需调用 LLM 即可立即运行 shell 命令。这些命令在 CLI 和消息平台（Telegram、Discord 等）均可使用。

```yaml
# ~/.hermes/config.yaml
quick_commands:
  status:
    type: exec
    command: systemctl status hermes-agent
  gpu:
    type: exec
    command: nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader
```

然后在任何聊天中输入 `/status` 或 `/gpu`。更多示例参见[配置指南](/docs/user-guide/configuration#quick-commands)。

## 启动时预加载技能

如果您已知道会话中需要哪些技能，可在启动时传入：

```bash
hermes -s hermes-agent-dev,github-auth
hermes chat -s github-pr-workflow -s github-auth
```

Hermes 在第一个 turn 之前将每个命名技能加载到会话提示中。相同标志适用于交互模式和单次查询模式。

## 技能斜杠命令

`~/.hermes/skills/` 中的每个已安装技能都会自动注册为斜杠命令。技能名称成为命令：

```
/gif-search 好笑的猫
/axolotl 帮我用我的数据集微调 Llama 3
/github-pr-workflow 为 auth 重构创建一个 PR

# 仅输入技能名称会加载它，让 agent 询问需要什么：
/excalidraw
```

## 人格设定

设置预定义人格以改变 agent 的语气：

```
/personality pirate
/personality kawaii
/personality concise
```

内置人格包括：`helpful`、`concise`、`technical`、`creative`、`teacher`、`kawaii`、`catgirl`、`pirate`、`shakespeare`、`surfer`、`noir`、`uwu`、`philosopher`、`hype`。

您也可以在 `~/.hermes/config.yaml` 中定义自定义人格：

```yaml
personalities:
  helpful: "你是一个乐于助人、友好的 AI 助手。"
  kawaii: "你是一个可爱的助手！使用可爱的表达方式..."
  pirate: "啊哈！你正在和 Hermes 船长说话..."
  # 添加你自己的！
```

## 多行输入

有两种方式输入多行消息：

1. **`Alt+Enter` 或 `Ctrl+J`** — 插入新行
2. **反斜杠续行** — 在行尾加 `\` 继续：

```
❯ 写一个函数：\
  1. 接收一个数字列表\
  2. 返回总和
```

:::info
支持粘贴多行文本——使用 `Alt+Enter` 或 `Ctrl+J` 插入换行符，或直接粘贴内容。
:::

## 打断 Agent

您可以随时打断 agent：

- 在 agent 工作时输入新消息 + Enter——它会打断并处理您的新指令
- **`Ctrl+C`** — 打断当前操作（2 秒内双击强制退出）
- 进行中的终端命令会立即终止（SIGTERM，然后 1 秒后 SIGKILL）
- 在打断期间输入的多条消息会合并为一个提示

### 忙碌输入模式

`display.busy_input_mode` 配置键控制当您在 agent 工作时按 Enter 时的行为：

| 模式 | 行为 |
|------|------|
| `"interrupt"`（默认）| 您的消息打断当前操作并立即处理 |
| `"queue"` | 您的消息被静默排队，在 agent 完成后作为下一个 turn 发送 |

```yaml
# ~/.hermes/config.yaml
display:
  busy_input_mode: "queue"   # 或 "interrupt"（默认）
```

队列模式适用于您想准备后续消息而不意外取消进行中的工作时。不知道的值会回退到 `"interrupt"`。

### 挂起到后台

在 Unix 系统上，按 **`Ctrl+Z`** 将 Hermes 挂起到后台——就像任何终端进程一样。shell 会打印确认：

```
Hermes Agent 已挂起。运行 `fg` 恢复 Hermes Agent。
```

在 shell 中输入 `fg` 从上次中断的地方恢复会话。不支持 Windows。

## 工具进度显示

CLI 在 agent 工作时显示动画反馈：

**思考动画**（API 调用期间）：
```
  ◜ (｡•́︿•̀｡) 思考中... (1.2s)
  ◠ (⊙_⊙) 深思中... (2.4s)
  ✧٩(ˊᗜˋ*)و✧ 明白了！ (3.1s)
```

**工具执行流：**
```
  ┊ 💻 terminal `ls -la` (0.3s)
  ┊ 🔍 web_search (1.2s)
  ┊ 📄 web_extract (2.1s)
```

使用 `/verbose` 循环切换显示模式：`off → new → all → verbose`。此命令也可为消息平台启用——参见[配置](/docs/user-guide/configuration#display-settings)。

### 工具预览长度

`display.tool_preview_length` 配置键控制工具调用预览行中显示的最大字符数（例如文件路径、终端命令）。默认值为 `0`，即无限制——显示完整路径和命令。

```yaml
# ~/.hermes/config.yaml
display:
  tool_preview_length: 80   # 将工具预览截断为 80 个字符（0 = 无限制）
```

这在窄终端或工具参数包含非常长文件路径时很有用。

## 会话管理

### 恢复会话

退出 CLI 会话时，会打印恢复命令：

```
使用以下命令恢复此会话：
  hermes --resume 20260225_143052_a1b2c3

会话：        20260225_143052_a1b2c3
时长：        12m 34s
消息：        28（5 条用户消息，18 次工具调用）
```

恢复选项：

```bash
hermes --continue                          # 恢复最近的 CLI 会话
hermes -c                                  # 短格式
hermes -c "我的项目"                     # 按名称恢复会话（系谱中最新的）
hermes --resume 20260225_143052_a1b2c3     # 按 ID 恢复特定会话
hermes --resume "重构 auth"         # 按标题恢复
hermes -r 20260225_143052_a1b2c3           # 短格式
```

恢复会从 SQLite 完整恢复对话历史。agent 可以看到所有先前的消息、工具调用和响应——就像您从未离开过一样。

使用聊天中的 `/title 我的会话名称` 为当前会话命名，或从命令行使用 `hermes sessions rename <id> <title>`。使用 `hermes sessions list` 浏览过去的会话。

### 会话存储

CLI 会话存储在 Hermes 的 SQLite 状态数据库 `~/.hermes/state.db` 中。数据库保留：

- 会话元数据（ID、标题、时间戳、token 计数器）
- 消息历史
- 压缩/恢复会话的系谱
- `session_search` 使用的全文搜索索引

某些消息适配器也会在数据库旁边保留每个平台的转录文件，但 CLI 本身从 SQLite 会话存储恢复。

### 上下文压缩

当对话接近上下文限制时，会自动汇总长对话：

```yaml
# 在 ~/.hermes/config.yaml 中
compression:
  enabled: true
  threshold: 0.50    # 默认在上下文限制的 50% 时压缩
  summary_model: "google/gemini-3-flash-preview"  # 用于摘要的模型
```

当压缩触发时，中间的 turns 会被汇总，而前 3 个和后 4 个 turns 始终保留。

## 后台会话

在后台独立会话中运行提示，同时继续使用 CLI 进行其他工作：

```
/background 分析 /var/log 中的日志并总结今天的任何错误
```

Hermes 立即确认任务并返回提示：

```
🔄 后台任务 #1 已启动："分析 /var/log 中的日志并总结..."
   任务 ID：bg_143022_a1b2c3
```

### 工作原理

每个 `/background` 提示都会在守护线程中生成一个**完全独立的 agent 会话**：

- **隔离对话** — 后台 agent 不了解您当前会话的历史。它只接收您提供的提示。
- **相同配置** — 后台 agent 继承当前会话的模型、provider、工具集、推理设置和回退模型。
- **非阻塞** — 您的前台会话保持完全可交互。您可以聊天、运行命令，甚至启动更多后台任务。
- **多个任务** — 您可以同时运行多个后台任务。每个任务都有一个编号 ID。

### 结果

后台任务完成后，结果会显示在终端的面板中：

```
╭─ ⚕ Hermes（后台 #1）───────────────────────────────────╮
│ 今天在 syslog 中发现 3 个错误：                          │
│ 1. OOM killer 在 03:22 被调用——杀死进程 nginx          │
│ 2. /dev/sda1 在 07:15 磁盘 I/O 错误                     │
│ 3. 14:30 从 192.168.1.50 失败的 SSH 登录尝试             │
╰──────────────────────────────────────────────────────────────╯
```

如果任务失败，您会看到错误通知。如果配置中启用了 `display.bell_on_complete`，任务完成时终端铃声会响。

### 使用场景

- **长时间研究** — "/background 研究量子纠错的最新发展"，同时您在写代码
- **文件处理** — "/background 分析此仓库中的所有 Python 文件并列出任何安全问题"，同时您继续对话
- **并行调查** — 启动多个后台任务同时探索不同角度

:::info
后台会话不会出现在您的主要对话历史中。它们是独立会话，有自己的任务 ID（例如 `bg_143022_a1b2c3`）。
:::

## 安静模式

默认情况下，CLI 以安静模式运行：
- 抑制工具的详细日志
- 启用 kawaii 风格的动画反馈
- 保持输出简洁、用户友好

要获取调试输出：
```bash
hermes chat --verbose
```
