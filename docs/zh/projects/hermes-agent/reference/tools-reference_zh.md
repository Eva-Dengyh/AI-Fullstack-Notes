---
title: "内置工具参考"
description: "按工具集分组的 Hermes 内置工具权威参考"
---

# 内置工具参考

本页记录 Hermes 工具注册表中的全部 47 个内置工具，并按工具集分组。具体可用性取决于平台、凭据和已启用的工具集。

**快速统计：**10 个浏览器工具、4 个文件工具、10 个 RL 工具、4 个 Home Assistant 工具、2 个终端工具、2 个网页工具，以及分布在其他工具集中的 15 个独立工具。

:::tip MCP 工具
除了内置工具外，Hermes 还可以从 MCP 服务器动态加载工具。MCP 工具会带有服务器名前缀（例如 `github` MCP 服务器暴露的 `github_create_issue`）。配置方式参见 [MCP 集成](/docs/user-guide/features/mcp)。
:::

## `browser` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `browser_back` | 在浏览器历史记录中返回上一页。必须先调用 `browser_navigate`。 | — |
| `browser_click` | 点击快照中通过 ref ID 标识的元素（例如 `@e5`）。这些 ref ID 会出现在快照输出的方括号中。必须先调用 `browser_navigate` 和 `browser_snapshot`。 | — |
| `browser_console` | 获取当前页面的浏览器控制台输出与 JavaScript 错误，包括 `console.log/warn/error/info` 消息及未捕获 JS 异常。适合用来排查静默 JS 错误、失败的 API 调用和应用警告。 | — |
| `browser_get_images` | 获取当前页面所有图片的列表，包括 URL 与 alt 文本。适合为视觉工具寻找待分析图片。必须先调用 `browser_navigate`。 | — |
| `browser_navigate` | 在浏览器中打开某个 URL，初始化会话并加载页面。其他浏览器工具都必须建立在它之后。若只是简单获取信息，优先使用 `web_search` 或 `web_extract`，更快也更便宜。只有在需要交互时再使用浏览器工具。 | — |
| `browser_press` | 按下一个键盘按键。适合提交表单（Enter）、页面导航（Tab）或快捷键操作。必须先调用 `browser_navigate`。 | — |
| `browser_scroll` | 按方向滚动页面，用于展示当前视口上下方的更多内容。必须先调用 `browser_navigate`。 | — |
| `browser_snapshot` | 获取当前页面可访问性树的文本快照。返回带 ref ID（如 `@e1`、`@e2`）的交互元素，供 `browser_click` 和 `browser_type` 使用。`full=false`（默认）时返回紧凑视图；`full=true` 返回完整树。 | — |
| `browser_type` | 向由 ref ID 指定的输入框输入文本。会先清空原内容，再输入新文本。必须先调用 `browser_navigate` 和 `browser_snapshot`。 | — |
| `browser_vision` | 截取当前页面截图，并交给视觉 AI 分析。当你需要从视觉上理解页面内容时使用它，尤其适合验证码、视觉校验、复杂布局或文字快照不够用的情况。 | — |

## `clarify` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `clarify` | 当继续执行前需要用户确认、反馈或做决定时，用它向用户提问。支持两种模式：1）**单选题**，最多提供 4 个选项，用户也可通过第 5 个“Other”选项自行输入；2）自由文本。 | — |

## `code_execution` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `execute_code` | 运行一个可编程调用 Hermes 工具的 Python 脚本。适合以下场景：需要 3 次以上工具调用且中间有处理逻辑；需要在工具输出进入上下文前先做过滤 / 归约；或需要条件分支。 | — |

## `cronjob` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `cronjob` | 统一的定时任务管理器。使用 `action="create"`、`"list"`、`"update"`、`"pause"`、`"resume"`、`"run"` 或 `"remove"` 来管理任务。支持绑定一个或多个技能；更新时传 `skills=[]` 可清空已绑定技能。Cron 运行发生在全新会话中，不继承当前聊天上下文。 | — |

## `delegation` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `delegate_task` | 启动一个或多个子 agent，在隔离上下文中处理任务。每个子 agent 都有自己的对话、终端会话和工具集。只有最终摘要会返回到当前上下文，中间工具结果不会进入你的上下文窗口。 | — |

## `file` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `patch` | 对文件做有针对性的查找替换编辑。优先用它，而不是在终端里用 `sed` / `awk`。使用模糊匹配（9 种策略），即便有轻微空白或缩进差异也不容易失败。返回统一 diff，编辑后还会自动做语法检查。 | — |
| `read_file` | 按行号和分页读取文本文件。优先用它，而不是在终端中 `cat` / `head` / `tail`。输出格式为 `LINE_NUM|CONTENT`。找不到文件时会建议相近文件名。大文件可用 `offset` 和 `limit` 分页。注意：不能读取图片等二进制资源。 | — |
| `search_files` | 搜索文件内容或按名称找文件。优先用它，而不是终端中的 `grep` / `rg` / `find` / `ls`。底层使用 ripgrep，速度通常更快。支持内容检索（`target='content'`）和文件名检索。 | — |
| `write_file` | 向文件写入内容，会完整替换原文件。优先用它，而不是在终端中通过 `echo` 或 heredoc 写文件。会自动创建父目录。**注意：它会覆盖整个文件**，局部修改请用 `patch`。 | — |

## `homeassistant` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `ha_call_service` | 调用 Home Assistant 服务以控制设备。可先用 `ha_list_services` 查看可用服务及其参数。 | — |
| `ha_get_state` | 获取某个 Home Assistant 实体的详细状态，包括亮度、颜色、温控设定、传感器读数等全部属性。 | — |
| `ha_list_entities` | 列出 Home Assistant 实体。可按 domain（如 light、switch、climate、sensor 等）或 area 名称（如 living room、kitchen、bedroom）过滤。 | — |
| `ha_list_services` | 列出可用的 Home Assistant 服务（动作），展示每类设备能执行什么操作以及接受哪些参数。通常先发现实体，再用它查看控制方式。 | — |

:::note
**Honcho 工具**（`honcho_conclude`、`honcho_context`、`honcho_profile`、`honcho_search`）已不再属于内置工具。它们现在由位于 `plugins/memory/honcho/` 的 Honcho 记忆 provider 插件提供。安装与使用方式请参见 [Plugins](../user-guide/features/plugins.md)。
:::

## `image_gen` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `image_generate` | 使用 FLUX 2 Pro 模型根据文本提示生成高质量图片，并自动进行 2 倍放大，得到更高分辨率结果。返回单张放大后的图片 URL。 | `FAL_KEY` |

## `memory` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `memory` | 将重要信息保存到可跨会话持久化的记忆中。记忆会在每次会话开始时出现在系统提示中，让 agent 在不同对话间记住与你和环境相关的信息。 | — |

## `messaging` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `send_message` | 向已连接的消息平台发送消息，或列出可用投递目标。**重要：**当用户要求发给某个具体频道或某个人时，应先调用 `send_message(action='list')` 查看可选目标。 | — |

## `moa` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `mixture_of_agents` | 让多个前沿 LLM 协同处理复杂问题。一次调用会发起 5 次 API 请求（4 个参考模型 + 1 个聚合模型），并使用最高推理强度，因此应谨慎使用，只在真正困难的问题上启用。 | `OPENROUTER_API_KEY` |

## `rl` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `rl_check_status` | 获取某个训练运行的状态和指标。**有限流**：对同一个 run 至少间隔 30 分钟才能再次检查。返回 WandB 指标，如 step、state、reward_mean、loss、percent_correct。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_edit_config` | 更新某个配置字段。应先用 `rl_get_current_config()` 查看所选环境允许修改的字段。不同环境可配项不同，而部分基础设施参数不可改。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_get_current_config` | 获取当前环境配置。只返回允许修改的字段，如 `group_size`、`max_token_length`、`total_steps`、`steps_per_eval`、`use_wandb`、`wandb_name`、`max_num_workers`。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_get_results` | 获取已完成训练运行的最终结果与指标，包括训练权重路径。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_list_environments` | 列出所有可用 RL 环境，返回环境名、路径与说明。提示：可用文件工具读取 `file_path`，理解环境的 verifier、数据加载和奖励机制。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_list_runs` | 列出所有训练运行（进行中和已完成）。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_select_environment` | 选择一个用于训练的 RL 环境，并加载其默认配置。之后用 `rl_get_current_config()` 查看配置，用 `rl_edit_config()` 修改。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_start_training` | 用当前环境和配置启动新的 RL 训练。大部分训练参数（如 `lora_rank`、`learning_rate`）固定不可改。启动前可用 `rl_edit_config()` 设置 `group_size`、`batch_size`、`wandb_project` 等。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_stop_training` | 停止一个正在运行的训练任务。适用于指标异常、训练停滞或想切换配置重试的情况。 | `TINKER_API_KEY`, `WANDB_API_KEY` |
| `rl_test_inference` | 对任意环境做快速推理测试。会运行若干步推理与评分，并通过 OpenRouter 执行。默认是 3 steps × 16 completions，再测 3 个模型，总计 144 次 rollout。可用于验证环境加载、提示构建和推理流程。 | `TINKER_API_KEY`, `WANDB_API_KEY` |

## `session_search` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `session_search` | 搜索你过去对话的长期记忆，相当于“召回”历史会话。用户说“我们以前做过这个”“记得上次吗”之类时，应主动使用。 | — |

## `skills` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `skill_manage` | 管理技能（创建、更新、删除）。技能相当于程序化记忆，用于复用处理重复任务的方法。新技能默认放在 `~/.hermes/skills/`，已有技能则可在原位置修改。 | — |
| `skill_view` | 技能可加载特定任务与工作流信息，也可能关联 references、templates、scripts 等文件。首次调用会返回 `SKILL.md` 内容以及可加载的链接文件。 | — |
| `skills_list` | 列出可用技能（名称 + 描述）。可再用 `skill_view(name)` 查看完整内容。 | — |

## `terminal` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `process` | 管理由 `terminal(background=true)` 启动的后台进程。支持 `list`、`poll`、`log`、`wait`、`kill`、`write` 等动作。 | — |
| `terminal` | 在 Linux 环境中执行 shell 命令。文件系统会在多次调用间保持。长时间运行的任务可设置 `background=true`；配合 `notify_on_complete=true` 可以在完成时自动通知，无需轮询。不要用 `cat` / `head` / `tail`，改用 `read_file`；不要用 `grep` / `rg` / `find`，改用 `search_files`。 | — |

## `todo` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `todo` | 管理当前会话的任务列表。适合 3 步以上的复杂任务，或用户一次提出多个事项时使用。不带参数调用会读取当前列表；写入时通过 `todos` 数组创建或更新项目。 | — |

## `vision` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `vision_analyze` | 使用视觉 AI 分析图片，提供完整描述，并回答关于图片内容的具体问题。 | — |

## `web` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `web_search` | 在网页上搜索任意主题信息。最多返回 5 个相关结果，包括标题、URL 和简介。 | `EXA_API_KEY` 或 `PARALLEL_API_KEY` 或 `FIRECRAWL_API_KEY` 或 `TAVILY_API_KEY` |
| `web_extract` | 从网页 URL 中提取内容，返回 markdown 格式。同样支持 PDF URL，直接传 PDF 链接即可转成 markdown 文本。5000 字符以内的页面返回完整 markdown；更大的页面则由 LLM 摘要。 | `EXA_API_KEY` 或 `PARALLEL_API_KEY` 或 `FIRECRAWL_API_KEY` 或 `TAVILY_API_KEY` |

## `tts` 工具集

| 工具 | 说明 | 所需环境 |
|------|-------------|----------------------|
| `text_to_speech` | 将文本转换为语音音频。返回一个 `MEDIA:` 路径，由平台以语音消息形式发送。在 Telegram 中会显示为语音气泡，在 Discord / WhatsApp 中则是音频附件。在 CLI 模式下会保存到 `~/voice-memos/`。 | — |
