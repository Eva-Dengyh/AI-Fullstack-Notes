---
title: "定时任务（Cron）"
description: "用自然语言安排自动化任务、用一个 cron 工具管理它们，并附加一个或多个技能"
---

# 定时任务（Cron）

用自然语言或 cron 表达式安排自动运行的任务。Hermes 通过单一 `cronjob` 工具暴露 cron 管理，带操作风格操作而非单独的 schedule/list/remove 工具。

## Cron 现在能做什么

Cron 任务可以：

- 安排一次性或定期任务
- 暂停、恢复、编辑、触发和删除任务
- 附加零、一或多个技能到任务
- 将结果递送回源聊天、本地文件或配置平台目标
- 在新 Agent 会话中运行，具有正常静态工具列表

:::warning
Cron 运行会话无法递归创建更多 cron 任务。Hermes 在 cron 执行内禁用 cron 管理工具以防止失控调度循环。
:::

## 创建定时任务

### 在聊天中用 `/cron`

```bash
/cron add 30m "提醒我检查构建"
/cron add "every 2h" "检查服务器状态"
/cron add "every 1h" "总结新 feed 项目" --skill blogwatcher
/cron add "every 1h" "使用两个技能并组合结果" --skill blogwatcher --skill find-nearby
```

### 从独立 CLI

```bash
hermes cron create "every 2h" "检查服务器状态"
hermes cron create "every 1h" "总结新 feed 项目" --skill blogwatcher
hermes cron create "every 1h" "使用两个技能并组合结果" \
  --skill blogwatcher \
  --skill find-nearby \
  --name "技能组合"
```

### 通过自然对话

正常要求 Hermes：

```text
每天早上 9 点，检查 Hacker News 上的 AI 新闻并在 Telegram 上给我一份总结。
```

Hermes 内部会使用统一 `cronjob` 工具。

## 技能支持的 cron 任务

Cron 任务可在运行提示前加载一个或多个技能。

### 单个技能

```python
cronjob(
    action="create",
    skill="blogwatcher",
    prompt="检查配置的 feed 并总结任何新内容。",
    schedule="0 9 * * *",
    name="晨间 feed",
)
```

### 多个技能

技能按顺序加载。提示成为分层在这些技能之上的任务指令。

```python
cronjob(
    action="create",
    skills=["blogwatcher", "find-nearby"],
    prompt="寻找新的本地事件和有趣的附近地点，然后将它们组合成一个短摘要。",
    schedule="every 6h",
    name="本地摘要",
)
```

当你想让调度 Agent 继承可复用工作流而无需将完整技能文本塞进 cron 提示时很有用。

## 编辑任务

你无需删除并重新创建任务就能改变它们。

### 聊天

```bash
/cron edit <job_id> --schedule "every 4h"
/cron edit <job_id> --prompt "使用修订任务"
/cron edit <job_id> --skill blogwatcher --skill find-nearby
/cron edit <job_id> --remove-skill blogwatcher
/cron edit <job_id> --clear-skills
```

### 独立 CLI

```bash
hermes cron edit <job_id> --schedule "every 4h"
hermes cron edit <job_id> --prompt "使用修订任务"
hermes cron edit <job_id> --skill blogwatcher --skill find-nearby
hermes cron edit <job_id> --add-skill find-nearby
hermes cron edit <job_id> --remove-skill blogwatcher
hermes cron edit <job_id> --clear-skills
```

笔记：

- 重复 `--skill` 替换任务的附加技能列表
- `--add-skill` 附加到现有列表而不替换它
- `--remove-skill` 删除特定附加技能
- `--clear-skills` 删除所有附加技能

## 生命周期操作

Cron 任务现在比仅创建/删除具有更完整的生命周期。

### 聊天

```bash
/cron list
/cron pause <job_id>
/cron resume <job_id>
/cron run <job_id>
/cron remove <job_id>
```

### 独立 CLI

```bash
hermes cron list
hermes cron pause <job_id>
hermes cron resume <job_id>
hermes cron run <job_id>
hermes cron remove <job_id>
hermes cron status
hermes cron tick
```

它们做什么：

- `pause` — 保持任务但停止调度它
- `resume` — 重新启用任务并计算下一个未来运行
- `run` — 在下一个调度器滴答时触发任务
- `remove` — 完全删除它

## 工作原理

**Cron 执行由网关守护进程处理。** 网关每 60 秒滴答调度器一次，在隔离 Agent 会话中运行任何到期任务。

```bash
hermes gateway install     # 安装为用户服务
sudo hermes gateway install --system   # Linux：服务器启动时系统服务
hermes gateway             # 或在前台运行

hermes cron list
hermes cron status
```

### 网关调度器行为

在每个滴答，Hermes：

1. 从 `~/.hermes/cron/jobs.json` 加载任务
2. 对照当前时间检查 `next_run_at`
3. 为每个到期任务启动新 `AIAgent` 会话
4. 可选择性地将一个或多个附加技能注入该新会话
5. 运行提示到完成
6. 递送最终响应
7. 更新运行元数据和下一调度时间

文件锁在 `~/.hermes/cron/.tick.lock` 防止重叠调度器滴答从相同任务批重复运行。

## 递送选项

安排任务时，你指定输出去向：

| 选项 | 描述 | 示例 |
|--------|-------------|---------|
| `"origin"` | 回到任务创建位置 | 消息平台上的默认值 |
| `"local"` | 仅保存到本地文件（`~/.hermes/cron/output/`） | CLI 上的默认值 |
| `"telegram"` | Telegram 主频道 | 使用 `TELEGRAM_HOME_CHANNEL` |
| `"telegram:123456"` | 按 ID 特定 Telegram 聊天 | 直接递送 |
| `"telegram:-100123:17585"` | 特定 Telegram 话题 | `chat_id:thread_id` 格式 |
| `"discord"` | Discord 主频道 | 使用 `DISCORD_HOME_CHANNEL` |
| `"discord:#engineering"` | 按频道名称特定 Discord 频道 | 按频道名 |
| `"slack"` | Slack 主频道 | |
| `"whatsapp"` | WhatsApp 主页 | |
| `"signal"` | Signal | |
| `"matrix"` | Matrix 主房间 | |
| `"mattermost"` | Mattermost 主频道 | |
| `"email"` | Email | |
| `"sms"` | 通过 Twilio 的 SMS | |
| `"homeassistant"` | Home Assistant | |
| `"dingtalk"` | DingTalk | |
| `"feishu"` | Feishu/Lark | |
| `"wecom"` | WeCom | |
| `"weixin"` | 微信 (WeChat) | |
| `"bluebubbles"` | BlueBubbles (iMessage) | |

Agent 的最终响应自动递送。你无需在 cron 提示中调用 `send_message`。

### 响应包装

默认地，递送的 cron 输出用标题和页脚包装，以便接收者知道它来自定时任务：

```
Cronjob 响应：晨间 feed
-------------

<Agent 输出在这里>

注意：Agent 看不到此消息，因此无法响应它。
```

要递送原始 Agent 输出而不包装，设置 `cron.wrap_response` 为 `false`：

```yaml
# ~/.hermes/config.yaml
cron:
  wrap_response: false
```

### 无声抑制

如果 Agent 的最终响应以 `[SILENT]` 开始，递送完全被抑制。输出仍保存在本地用于审计（在 `~/.hermes/cron/output/`），但没有消息被发到递送目标。

这对监控任务很有用，应仅在出错时报告：

```text
检查 nginx 是否运行。如果所有内容健康，仅用 [SILENT] 响应。
否则，报告问题。
```

失败任务始终递送不管 `[SILENT]` 标记 — 仅成功运行可被无声。

## 脚本超时

预运行脚本（通过 `script` 参数附加）有 120 秒默认超时。如果你的脚本需要更长 — 例如，包含随机化延迟以避免机器人风格计时 — 你可增加这个：

```yaml
# ~/.hermes/config.yaml
cron:
  script_timeout_seconds: 300   # 5 分钟
```

或设置 `HERMES_CRON_SCRIPT_TIMEOUT` 环境变量。分辨率顺序是：环境变量 → config.yaml → 120s 默认值。

## 提供商恢复

Cron 任务继承你配置的回退提供商和凭证池轮换。如果主 API 密钥被速率限制或提供商返回错误，cron Agent 可以：

- **回退到替代提供商**如果你配置了 `fallback_providers`（或遗留 `fallback_model`）
- **轮换到下一凭证**在 [credential pool](/docs/user-guide/configuration#credential-pool-strategies) 中用于同一提供商

这意味着高频率或高峰时运行的 cron 任务更有弹性 — 单一速率限制密钥不会使整个运行失败。

## 时间表格式

Agent 的最终响应自动递送 — 你**不需要**在 cron 提示中包括 `send_message` 给那个目标。如果 cron 运行调用 `send_message` 到调度器已会递送的确切目标，Hermes 跳过那个重复发送并告诉模型把用户面向内容放在最终响应中。仅在其他或不同目标中使用 `send_message`。

### 相对延迟（一次性）

```text
30m     → 在 30 分钟内运行一次
2h      → 在 2 小时内运行一次
1d      → 在 1 天内运行一次
```

### 间隔（定期）

```text
every 30m    → 每 30 分钟
every 2h     → 每 2 小时
every 1d     → 每天
```

### Cron 表达式

```text
0 9 * * *       → 每天 9:00 AM
0 9 * * 1-5     → 工作日 9:00 AM
0 */6 * * *     → 每 6 小时
30 8 1 * *      → 每月第一天 8:30 AM
0 0 * * 0       → 每周日午夜
```

### ISO 时间戳

```text
2026-03-15T09:00:00    → 2026 年 3 月 15 日 9:00 AM 一次
```

## 重复行为

| 时间表类型 | 默认重复 | 行为 |
|------------|----------|----------|
| 一次性（`30m`、时间戳） | 1 | 运行一次 |
| 间隔（`every 2h`） | forever | 运行直到被删除 |
| Cron 表达式 | forever | 运行直到被删除 |

你可覆盖它：

```python
cronjob(
    action="create",
    prompt="...",
    schedule="every 2h",
    repeat=5,
)
```

## 以编程方式管理任务

Agent 面向 API 是一个工具：

```python
cronjob(action="create", ...)
cronjob(action="list")
cronjob(action="update", job_id="...")
cronjob(action="pause", job_id="...")
cronjob(action="resume", job_id="...")
cronjob(action="run", job_id="...")
cronjob(action="remove", job_id="...")
```

对于 `update`，传递 `skills=[]` 以删除所有附加技能。

## 任务存储

任务存储在 `~/.hermes/cron/jobs.json`。任务运行输出保存到 `~/.hermes/cron/output/{job_id}/{timestamp}.md`。

存储使用原子文件写，所以中断的写不会在部分写任务文件后留下。

## 自包含提示仍然很重要

:::warning 重要
Cron 任务在完全新的 Agent 会话中运行。提示必须包含 Agent 需要的一切（不是已由附加技能提供的）。
:::

**坏的：** `"检查那个服务器问题"`

**好的：** `"SSH 到服务器 192.168.1.100 作为用户 'deploy'，用 'systemctl status nginx' 检查 nginx 是否运行，并验证 https://example.com 返回 HTTP 200。"`

## 安全

定时任务提示在创建和更新时被扫描以查找提示注入和凭证泄露模式。包含不可见 Unicode 技巧、SSH 后门尝试或明显秘密泄露有效负载的提示被阻止。
