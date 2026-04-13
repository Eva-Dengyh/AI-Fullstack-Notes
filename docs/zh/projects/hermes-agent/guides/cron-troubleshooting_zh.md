---
title: "Cron 排障指南"
description: "诊断并修复常见的 Hermes cron 问题，包括任务不触发、投递失败、skill 加载错误和性能问题"
---

# Cron 排障指南

当某个 cron 任务表现异常时，建议按顺序检查下面这些项目。大多数问题通常都落在四类：调度时间、消息投递、权限，或 skill 加载。

---

## 任务没有触发

### 检查 1：确认任务存在且处于激活状态

```bash
hermes cron list
```

找到目标任务，确认它的状态是 `[active]`，而不是 `[paused]` 或 `[completed]`。如果显示 `[completed]`，通常表示重复次数已经用完，需要编辑任务来重置。

### 检查 2：确认调度表达式正确

格式错误的调度表达式可能会被静默降级为一次性任务，或者直接被拒绝。你可以用下面的对照来检查：

| 你的表达式 | 应该表示 |
|----------------|-------------------|
| `0 9 * * *` | 每天早上 9:00 |
| `0 9 * * 1` | 每周一早上 9:00 |
| `every 2h` | 从现在起每 2 小时 |
| `30m` | 从现在起 30 分钟后 |
| `2025-06-01T09:00:00` | 2025 年 6 月 1 日 UTC 早上 9:00 |

如果任务执行过一次后就从列表里消失，那么它大概率是一次性调度（例如 `30m`、`1d` 或 ISO 时间戳），这是预期行为。

### 检查 3：Gateway 是否正在运行

Cron 任务是由 gateway 后台的 ticker 线程触发的，它默认每 60 秒 tick 一次。普通的 CLI 聊天会话**不会**自动触发 cron。

如果你希望任务自动执行，就必须有一个运行中的 gateway（`hermes gateway` 或 `hermes serve`）。如果只是做单次调试，也可以手动触发一次：`hermes cron tick`。

### 检查 4：系统时钟和时区

任务使用的是本地时区。如果机器时间不对，或者时区和你预期的不一致，任务触发时间就会偏掉。可以这样检查：

```bash
date
hermes cron list   # 对比 next_run 和本地时间
```

---

## 投递失败

### 检查 1：确认 deliver 目标写对了

投递目标大小写敏感，而且必须对应的平台已经正确配置。目标写错时，响应通常会被静默丢弃。

| Target | 需要具备 |
|--------|----------|
| `telegram` | `~/.hermes/.env` 中有 `TELEGRAM_BOT_TOKEN` |
| `discord` | `~/.hermes/.env` 中有 `DISCORD_BOT_TOKEN` |
| `slack` | `~/.hermes/.env` 中有 `SLACK_BOT_TOKEN` |
| `whatsapp` | 已配置 WhatsApp gateway |
| `signal` | 已配置 Signal gateway |
| `matrix` | 已配置 Matrix homeserver |
| `email` | `config.yaml` 中已配置 SMTP |
| `sms` | 已配置短信服务提供商 |
| `local` | 对 `~/.hermes/cron/output/` 具有写权限 |
| `origin` | 投递到创建该任务的聊天上下文 |

其他支持的平台还包括 `mattermost`、`homeassistant`、`dingtalk`、`feishu`、`wecom`、`weixin`、`bluebubbles` 和 `webhook`。你也可以用 `platform:chat_id` 语法指定具体会话，例如 `telegram:-1001234567890`。

如果投递失败，任务本身通常还是会执行，只是消息发不出去。可以在 `hermes cron list` 里查看 `last_error` 字段（如果该字段可用）。

### 检查 2：确认 `[SILENT]` 没被误用

如果 cron 任务没有产生输出，或者 Agent 的最终回复中包含 `[SILENT]`，投递就会被抑制。这本来就是监控类任务的常见设计，但也要确保你的提示词没有误把所有结果都压成沉默。

比如，“如果没变化就返回 `[SILENT]`”这种逻辑如果写得不严谨，也可能把本来应该发出的非空结果一起吞掉。

### 检查 3：平台 Token 权限

不同消息平台的机器人都需要具备对应权限，否则可能“看起来没报错，但就是发不出来”：

- **Telegram**：机器人必须在目标群组或频道中拥有管理员权限
- **Discord**：机器人必须有向目标频道发送消息的权限
- **Slack**：机器人必须已被加入工作区，并拥有 `chat:write` scope

### 检查 4：响应包装

默认情况下，cron 响应会在外层包上头尾信息（`config.yaml` 中 `cron.wrap_response: true`）。某些平台或集成对这种包装处理不好。你可以关闭它：

```yaml
cron:
  wrap_response: false
```

---

## Skill 加载失败

### 检查 1：确认 skill 已安装

```bash
hermes skills list
```

只有已安装的 skill 才能附加到 cron 任务上。如果缺失，请先用 `hermes skills install <skill-name>` 或在 CLI 里通过 `/skills` 安装。

### 检查 2：核对 skill 名称

Skill 名称区分大小写，而且必须与安装后的 skill 目录名一致。如果任务里写的是某个 skill，最好用 `hermes skills list` 再确认一次名称完全匹配。

### 检查 3：依赖交互式工具的 skill

Cron 任务会禁用 `cronjob`、`messaging` 和 `clarify` 工具集。这样可以防止递归创建 cron、直接消息发送（调度器会统一负责投递），以及需要人工交互的提示。如果某个 skill 依赖这些工具，它在 cron 环境中就不会正常工作。

所以要查看 skill 文档，确认它是否支持无交互（headless）模式。

### 检查 4：多 skill 加载顺序

如果你给任务配置了多个 skill，它们会按顺序加载。如果 Skill A 依赖 Skill B 提供的前置上下文，就必须保证 B 先加载：

```bash
/cron add "0 9 * * *" "..." --skill context-skill --skill target-skill
```

在这个例子里，`context-skill` 会先于 `target-skill` 加载。

---

## 任务执行报错或失败

### 检查 1：查看最近一次输出

如果任务确实跑了但失败了，错误信息可能出现在：

1. 任务投递到的聊天里（如果投递成功）
2. `~/.hermes/logs/agent.log` 中的调度器日志（或 `errors.log` 中的警告）
3. `hermes cron list` 提供的 `last_run` 元数据

### 检查 2：常见报错模式

**脚本提示 “No such file or directory”**
`script` 路径必须是绝对路径，或者是相对于 Hermes 配置目录的路径。确认如下：

```bash
ls ~/.hermes/scripts/your-script.py   # Must exist
hermes cron edit <job_id> --script ~/.hermes/scripts/your-script.py
```

**任务执行时提示 “Skill not found”**
说明调度器所在的机器上并没有安装这个 skill。如果你在多台机器之间切换，skill 不会自动同步，需要重新安装。

**任务跑了但没有任何投递**
一般是 deliver 目标有问题（见上面的投递失败部分），或者输出被 `[SILENT]` 静默抑制了。

**任务挂住或超时**
调度器使用的是基于“不活跃时间”的超时机制（默认 600 秒，可通过环境变量 `HERMES_CRON_TIMEOUT` 配置，设为 `0` 表示无限制）。只要 Agent 一直在积极调用工具，它就可以持续运行；只有长时间没有动作时才会触发超时。对于耗时很长的任务，建议把数据采集工作交给脚本做，最终只让 Agent 接收结果并分析。

### 检查 3：锁竞争

调度器通过文件锁防止同一时间发生重叠 tick。如果有两个 gateway 实例同时跑，或者 CLI 会话与 gateway 冲突，任务就可能被延迟甚至跳过。

可以先检查并清理重复进程：

```bash
ps aux | grep hermes
# Kill duplicate processes, keep only one
```

### 检查 4：`jobs.json` 权限

任务定义保存在 `~/.hermes/cron/jobs.json`。如果当前用户对这个文件没有读写权限，调度器可能静默失败：

```bash
ls -la ~/.hermes/cron/jobs.json
chmod 600 ~/.hermes/cron/jobs.json   # Your user should own it
```

---

## 性能问题

### 任务启动慢

每个 cron 任务都会创建一个全新的 `AIAgent` 会话，这可能涉及 provider 鉴权和模型准备。对于时间要求很严的任务，建议预留缓冲，例如把实际需要 9 点看到的任务安排在 8 点跑，而不是卡着 9 点。

### 同时到点的任务太多

调度器在每个 tick 中是顺序执行到期任务的。如果多个任务恰好同时到点，它们会一个接一个跑。为了减少排队延迟，可以把时间错开，例如用 `0 9 * * *` 和 `5 9 * * *`，而不是都堆在 `0 9 * * *`。

### 脚本输出太大

如果脚本向 stdout 倾倒几 MB 内容，Agent 不仅会变慢，还可能直接撞上 token 上限。更好的做法是在脚本里先过滤和总结，只输出 Agent 真正需要推理的那部分。

---

## 常用诊断命令

```bash
hermes cron list                    # 查看所有任务、状态和 next_run
hermes cron run <job_id>            # 让任务在下一个 tick 执行（测试用）
hermes cron edit <job_id>           # 修复配置问题
hermes logs                         # 查看最近日志
hermes skills list                  # 确认已安装的 skills
```

---

## 需要更多帮助时

如果你已经按这篇指南逐项排查，问题仍未解决：

1. 使用 `hermes cron run <job_id>` 让任务在下一个 gateway tick 执行，并观察聊天输出中的错误
2. 查看 `~/.hermes/logs/agent.log` 里的调度器日志，以及 `~/.hermes/logs/errors.log` 里的警告
3. 前往 [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) 提 issue，并附上：
   - 任务 ID 和调度表达式
   - 投递目标
   - 你的预期行为与实际行为
   - 日志中的相关错误信息

---

*完整的 cron 参考请同时查看 [用 Cron 自动化任何事](/docs/guides/automate-with-cron) 和 [Scheduled Tasks (Cron)](/docs/user-guide/features/cron)。*
