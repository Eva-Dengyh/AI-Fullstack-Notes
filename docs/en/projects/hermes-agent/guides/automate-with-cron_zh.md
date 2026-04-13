---
sidebar_position: 11
title: "用 Cron 自动化任何事"
description: "使用 Hermes cron 的真实自动化模式，包括监控、报告、流水线和多 skill 工作流"
---

# 用 Cron 自动化任何事

[每日简报机器人教程](/docs/guides/daily-briefing-bot) 介绍的是基础用法。这篇指南会继续深入，给出 5 种可以直接改造成你自己工作流的真实自动化模式。

完整功能参考见 [Scheduled Tasks (Cron)](/docs/user-guide/features/cron)。

:::info 核心概念
Cron 任务会在全新的 agent 会话里运行，不会记得你当前聊天里的内容。因此提示词必须**完全自包含**，把 Agent 需要知道的一切都写进去。
:::

---

## 模式 1：网站变更监控

监控某个 URL 的变化，并且只在确实发生变化时通知你。

这里的秘密武器是 `script` 参数。每次任务执行前，会先运行一个 Python 脚本，它的 stdout 会成为 Agent 的上下文。脚本负责机械性工作（抓取、比对），Agent 负责推理（这次变化是否值得关注）。

创建监控脚本：

```bash
mkdir -p ~/.hermes/scripts
```

```python title="~/.hermes/scripts/watch-site.py"
import hashlib, json, os, urllib.request

URL = "https://example.com/pricing"
STATE_FILE = os.path.expanduser("~/.hermes/scripts/.watch-site-state.json")

# Fetch current content
req = urllib.request.Request(URL, headers={"User-Agent": "Hermes-Monitor/1.0"})
content = urllib.request.urlopen(req, timeout=30).read().decode()
current_hash = hashlib.sha256(content.encode()).hexdigest()

# Load previous state
prev_hash = None
if os.path.exists(STATE_FILE):
    with open(STATE_FILE) as f:
        prev_hash = json.load(f).get("hash")

# Save current state
with open(STATE_FILE, "w") as f:
    json.dump({"hash": current_hash, "url": URL}, f)

# Output for the agent
if prev_hash and prev_hash != current_hash:
    print(f"CHANGE DETECTED on {URL}")
    print(f"Previous hash: {prev_hash}")
    print(f"Current hash: {current_hash}")
    print(f"\nCurrent content (first 2000 chars):\n{content[:2000]}")
else:
    print("NO_CHANGE")
```

配置 cron 任务：

```bash
/cron add "every 1h" "If the script output says CHANGE DETECTED, summarize what changed on the page and why it might matter. If it says NO_CHANGE, respond with just [SILENT]." --script ~/.hermes/scripts/watch-site.py --name "Pricing monitor" --deliver telegram
```

:::tip `[SILENT]` 技巧
当 Agent 的最终回复中包含 `[SILENT]` 时，投递会被抑制。这意味着你只会在真正发生事情时收到通知，而不会在风平浪静时被刷屏。
:::

---

## 模式 2：周报

把多个来源的信息汇总成格式化摘要。这个任务每周运行一次，并投递到你的 home channel。

```bash
/cron add "0 9 * * 1" "Generate a weekly report covering:

1. Search the web for the top 5 AI news stories from the past week
2. Search GitHub for trending repositories in the 'machine-learning' topic
3. Check Hacker News for the most discussed AI/ML posts

Format as a clean summary with sections for each source. Include links.
Keep it under 500 words — highlight only what matters." --name "Weekly AI digest" --deliver telegram
```

从 CLI 中也可以这样创建：

```bash
hermes cron create "0 9 * * 1" \
  "Generate a weekly report covering the top AI news, trending ML GitHub repos, and most-discussed HN posts. Format with sections, include links, keep under 500 words." \
  --name "Weekly AI digest" \
  --deliver telegram
```

`0 9 * * 1` 是标准 cron 表达式，含义是每周一早上 9 点。

---

## 模式 3：GitHub 仓库监控

定时监控某个仓库的新 issue、PR 或 release。

```bash
/cron add "every 6h" "Check the GitHub repository NousResearch/hermes-agent for:
- New issues opened in the last 6 hours
- New PRs opened or merged in the last 6 hours
- Any new releases

Use the terminal to run gh commands:
  gh issue list --repo NousResearch/hermes-agent --state open --json number,title,author,createdAt --limit 10
  gh pr list --repo NousResearch/hermes-agent --state all --json number,title,author,createdAt,mergedAt --limit 10

Filter to only items from the last 6 hours. If nothing new, respond with [SILENT].
Otherwise, provide a concise summary of the activity." --name "Repo watcher" --deliver discord
```

:::warning 自包含提示词
注意这里的提示词明确写出了要执行的 `gh` 命令。cron Agent 不会记得前一次运行，也不知道你的偏好，所以必须把关键信息写清楚。
:::

---

## 模式 4：数据采集流水线

按固定间隔抓取数据、保存到文件，并分析趋势变化。这个模式会把脚本（采集）和 Agent（分析）结合起来。

```python title="~/.hermes/scripts/collect-prices.py"
import json, os, urllib.request
from datetime import datetime

DATA_DIR = os.path.expanduser("~/.hermes/data/prices")
os.makedirs(DATA_DIR, exist_ok=True)

# Fetch current data (example: crypto prices)
url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd"
data = json.loads(urllib.request.urlopen(url, timeout=30).read())

# Append to history file
entry = {"timestamp": datetime.now().isoformat(), "prices": data}
history_file = os.path.join(DATA_DIR, "history.jsonl")
with open(history_file, "a") as f:
    f.write(json.dumps(entry) + "\n")

# Load recent history for analysis
lines = open(history_file).readlines()
recent = [json.loads(l) for l in lines[-24:]]  # Last 24 data points

# Output for the agent
print(f"Current: BTC=${data['bitcoin']['usd']}, ETH=${data['ethereum']['usd']}")
print(f"Data points collected: {len(lines)} total, showing last {len(recent)}")
print(f"\nRecent history:")
for r in recent[-6:]:
    print(f"  {r['timestamp']}: BTC=${r['prices']['bitcoin']['usd']}, ETH=${r['prices']['ethereum']['usd']}")
```

```bash
/cron add "every 1h" "Analyze the price data from the script output. Report:
1. Current prices
2. Trend direction over the last 6 data points (up/down/flat)
3. Any notable movements (>5% change)

If prices are flat and nothing notable, respond with [SILENT].
If there's a significant move, explain what happened." \
  --script ~/.hermes/scripts/collect-prices.py \
  --name "Price tracker" \
  --deliver telegram
```

脚本负责机械性数据采集，Agent 负责在结果之上做推理分析。

---

## 模式 5：多 Skill 工作流

复杂的定时任务可以把多个 skill 串起来。Skill 会按顺序加载，然后再执行提示词。

```bash
# Use the arxiv skill to find papers, then the obsidian skill to save notes
/cron add "0 8 * * *" "Search arXiv for the 3 most interesting papers on 'language model reasoning' from the past day. For each paper, create an Obsidian note with the title, authors, abstract summary, and key contribution." \
  --skill arxiv \
  --skill obsidian \
  --name "Paper digest"
```

也可以直接从工具层创建：

```python
cronjob(
    action="create",
    skills=["arxiv", "obsidian"],
    prompt="Search arXiv for papers on 'language model reasoning' from the past day. Save the top 3 as Obsidian notes.",
    schedule="0 8 * * *",
    name="Paper digest",
    deliver="local"
)
```

Skill 会按顺序加载：先加载 `arxiv`，教 Agent 如何搜索论文；再加载 `obsidian`，教它如何写笔记。提示词负责把两者串起来。

---

## 管理任务

```bash
# List all active jobs
/cron list

# Trigger a job immediately (for testing)
/cron run <job_id>

# Pause a job without deleting it
/cron pause <job_id>

# Edit a running job's schedule or prompt
/cron edit <job_id> --schedule "every 4h"
/cron edit <job_id> --prompt "Updated task description"

# Add or remove skills from an existing job
/cron edit <job_id> --skill arxiv --skill obsidian
/cron edit <job_id> --clear-skills

# Remove a job permanently
/cron remove <job_id>
```

---

## 投递目标

`--deliver` 参数控制结果发送到哪里：

| Target | 示例 | 使用场景 |
|--------|---------|----------|
| `origin` | `--deliver origin` | 创建任务的同一个聊天（默认） |
| `local` | `--deliver local` | 只保存为本地文件 |
| `telegram` | `--deliver telegram` | Telegram home channel |
| `discord` | `--deliver discord` | Discord home channel |
| `slack` | `--deliver slack` | Slack home channel |
| Specific chat | `--deliver telegram:-1001234567890` | 指定 Telegram 群组 |
| Threaded | `--deliver telegram:-1001234567890:17585` | 指定 Telegram topic thread |

---

## 使用建议

**提示词必须自包含。** cron 任务中的 Agent 不会记得你之前聊过什么。URL、仓库名、格式偏好和投递说明都要直接写进提示词。

**大量使用 `[SILENT]`。** 对监控类任务来说，建议总是包含“如果没有变化，就返回 `[SILENT]`”这样的指令。这样可以避免通知噪音。

**用脚本做数据采集。** `script` 参数可以让 Python 脚本处理 HTTP 请求、文件 I/O、状态跟踪这些无聊但稳定的工作。Agent 只需要读取脚本 stdout 并做推理，这比让 Agent 自己一步步抓取更便宜、更可靠。

**用 `/cron run` 测试。** 不要等到下一次调度时间才验证结果。先用 `/cron run <job_id>` 立即执行一次，确认输出符合预期。

**调度表达式。** `every 2h`、`30m`、`daily at 9am` 这类自然语言格式可以用，`0 9 * * *` 这种标准 cron 表达式也可以用。

---

*完整 cron 参考，包括所有参数、边界情况和内部机制，请见 [Scheduled Tasks (Cron)](/docs/user-guide/features/cron)。*
