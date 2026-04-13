---
sidebar_position: 4
title: "工具集参考"
description: "Hermes 核心、组合、平台与动态工具集参考"
---

# 工具集参考

工具集（toolset）是一组具名工具包，用来控制 agent 能做什么。它是按平台、按会话或按任务配置工具可用性的主要机制。

## 工具集如何工作

每个工具都且只属于一个工具集。启用某个工具集后，该包中的全部工具都会对 agent 可用。工具集分为三类：

- **核心（Core）**：一组逻辑上相关的工具，例如 `file` 包含 `read_file`、`write_file`、`patch`、`search_files`
- **组合（Composite）**：为常见场景组合多个核心工具集，例如 `debugging` 会组合文件、终端和网页工具
- **平台（Platform）**：针对特定部署环境的一整套工具配置，例如 `hermes-cli` 是交互式 CLI 会话的默认配置

## 配置工具集

### 按会话（CLI）

```bash
hermes chat --toolsets web,file,terminal
hermes chat --toolsets debugging        # 组合工具集，会展开为 file + terminal + web
hermes chat --toolsets all              # 全部工具
```

### 按平台（`config.yaml`）

```yaml
toolsets:
  - hermes-cli          # CLI 默认配置
  # - hermes-telegram   # 覆盖 Telegram gateway 的配置
```

### 交互式管理

```bash
hermes tools                            # curses UI，可按平台启用/禁用
```

或在会话中：

```text
/tools list
/tools disable browser
/tools enable rl
```

## 核心工具集

| 工具集 | 工具 | 用途 |
|---------|-------|---------|
| `browser` | `browser_back`, `browser_click`, `browser_console`, `browser_get_images`, `browser_navigate`, `browser_press`, `browser_scroll`, `browser_snapshot`, `browser_type`, `browser_vision`, `web_search` | 完整浏览器自动化。包含 `web_search` 作为快速查找时的兜底能力。 |
| `clarify` | `clarify` | 当 agent 需要澄清信息时向用户提问。 |
| `code_execution` | `execute_code` | 运行可编程调用 Hermes 工具的 Python 脚本。 |
| `cronjob` | `cronjob` | 安排和管理定时任务。 |
| `delegation` | `delegate_task` | 启动隔离的子 agent 实例进行并行工作。 |
| `file` | `patch`, `read_file`, `search_files`, `write_file` | 读写、搜索和编辑文件。 |
| `homeassistant` | `ha_call_service`, `ha_get_state`, `ha_list_entities`, `ha_list_services` | 通过 Home Assistant 控制智能家居。仅在设置 `HASS_TOKEN` 时可用。 |
| `image_gen` | `image_generate` | 通过 FAL.ai 生成文生图。 |
| `memory` | `memory` | 持久化的跨会话记忆管理。 |
| `messaging` | `send_message` | 在会话中向其他平台发送消息（Telegram、Discord 等）。 |
| `moa` | `mixture_of_agents` | 通过 Mixture of Agents 做多模型共识。 |
| `rl` | `rl_check_status`, `rl_edit_config`, `rl_get_current_config`, `rl_get_results`, `rl_list_environments`, `rl_list_runs`, `rl_select_environment`, `rl_start_training`, `rl_stop_training`, `rl_test_inference` | RL 训练环境管理（Atropos）。 |
| `search` | `web_search` | 仅网页搜索（不含提取）。 |
| `session_search` | `session_search` | 搜索过去的对话会话。 |
| `skills` | `skill_manage`, `skill_view`, `skills_list` | 技能的 CRUD 与浏览。 |
| `terminal` | `process`, `terminal` | Shell 命令执行与后台进程管理。 |
| `todo` | `todo` | 会话内任务列表管理。 |
| `tts` | `text_to_speech` | 文字转语音。 |
| `vision` | `vision_analyze` | 使用视觉模型分析图片。 |
| `web` | `web_extract`, `web_search` | 网页搜索与页面内容提取。 |

## 组合工具集

这些工具集会展开为多个核心工具集，适合常见场景下的快捷配置：

| 工具集 | 展开为 | 适用场景 |
|---------|-----------|----------|
| `debugging` | `patch`, `process`, `read_file`, `search_files`, `terminal`, `web_extract`, `web_search`, `write_file` | 调试会话：提供文件访问、终端与网页检索，不引入浏览器自动化或委派的额外开销。 |
| `safe` | `image_generate`, `mixture_of_agents`, `vision_analyze`, `web_extract`, `web_search` | 只读研究与媒体生成。无文件写入、无终端访问、无代码执行。适合不可信或受限环境。 |

## 平台工具集

平台工具集定义某个部署目标的完整工具配置。大多数消息平台与 `hermes-cli` 使用同一套工具：

| 工具集 | 与 `hermes-cli` 的差异 |
|---------|-------------------------------|
| `hermes-cli` | 完整工具集，包含全部 38 个工具以及 `clarify`。交互式 CLI 会话默认使用。 |
| `hermes-acp` | 去掉 `clarify`、`cronjob`、`image_generate`、`mixture_of_agents`、`send_message`、`text_to_speech` 以及 Home Assistant 工具。更专注于 IDE 场景下的编码任务。 |
| `hermes-api-server` | 去掉 `clarify`、`send_message` 和 `text_to_speech`。其余全部保留，适合无法直接与用户交互的程序化访问场景。 |
| `hermes-telegram` | 与 `hermes-cli` 相同。 |
| `hermes-discord` | 与 `hermes-cli` 相同。 |
| `hermes-slack` | 与 `hermes-cli` 相同。 |
| `hermes-whatsapp` | 与 `hermes-cli` 相同。 |
| `hermes-signal` | 与 `hermes-cli` 相同。 |
| `hermes-matrix` | 与 `hermes-cli` 相同。 |
| `hermes-mattermost` | 与 `hermes-cli` 相同。 |
| `hermes-email` | 与 `hermes-cli` 相同。 |
| `hermes-sms` | 与 `hermes-cli` 相同。 |
| `hermes-dingtalk` | 与 `hermes-cli` 相同。 |
| `hermes-feishu` | 与 `hermes-cli` 相同。 |
| `hermes-wecom` | 与 `hermes-cli` 相同。 |
| `hermes-wecom-callback` | WeCom 回调工具集，面向企业自建应用消息场景（完整访问权限）。 |
| `hermes-weixin` | 与 `hermes-cli` 相同。 |
| `hermes-bluebubbles` | 与 `hermes-cli` 相同。 |
| `hermes-homeassistant` | 与 `hermes-cli` 相同。 |
| `hermes-webhook` | 与 `hermes-cli` 相同。 |
| `hermes-gateway` | 所有消息平台工具集的并集。供 gateway 在需要尽可能广泛工具集时内部使用。 |

## 动态工具集

### MCP 服务器工具集

每个已配置的 MCP 服务器都会在运行时生成一个 `mcp-<server>` 工具集。例如，如果你配置了名为 `github` 的 MCP 服务器，就会创建一个 `mcp-github` 工具集，其中包含该服务器暴露的全部工具。

```yaml
# config.yaml
mcp:
  servers:
    github:
      command: npx
      args: ["-y", "@modelcontextprotocol/server-github"]
```

这会创建一个 `mcp-github` 工具集，你可以在 `--toolsets` 或平台配置中引用它。

### 插件工具集

插件可以在初始化期间通过 `ctx.register_tool()` 注册自己的工具集。这些工具集会与内置工具集并列出现，也可以用同样的方式启用或禁用。

### 自定义工具集

可在 `config.yaml` 中定义自定义工具集，以创建项目专属的组合包：

```yaml
toolsets:
  - hermes-cli
custom_toolsets:
  data-science:
    - file
    - terminal
    - code_execution
    - web
    - vision
```

### 通配符

- `all` 或 `*`：展开为全部已注册工具集（内置 + 动态 + 插件）

## 与 `hermes tools` 的关系

`hermes tools` 命令提供了一个基于 curses 的 UI，可按平台开启或关闭单个工具。它作用于工具级别，比工具集更细，并会将配置持久化到 `config.yaml`。即使某个工具集已启用，其中被禁用的工具仍会被过滤掉。

另请参见：[工具参考](./tools-reference_zh.md)，查看完整的单个工具列表及其参数说明。
