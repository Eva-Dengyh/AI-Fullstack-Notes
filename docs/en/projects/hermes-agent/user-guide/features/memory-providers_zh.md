---
title: "内存提供商"
description: "外部内存提供商插件 — Honcho、OpenViking、Mem0、Hindsight、Holographic、RetainDB、ByteRover、Supermemory"
---

# 内存提供商

Hermes Agent 附带 8 个外部内存提供商插件，给 Agent 建立在 MEMORY.md 和 USER.md 之外的持久跨会话知识。只有**一个**外部提供商可以同时活跃 — 内置内存总是与它一起活跃。

## 快速开始

```bash
hermes memory setup      # 交互式选择器 + 配置
hermes memory status     # 检查什么是活跃的
hermes memory off        # 禁用外部提供商
```

你也可以通过 `hermes plugins` → Provider Plugins → Memory Provider 选择活跃的内存提供商。

或在 `~/.hermes/config.yaml` 中手动设置：

```yaml
memory:
  provider: openviking   # 或 honcho、mem0、hindsight、holographic、retaindb、byterover、supermemory
```

## 工作原理

当内存提供商活跃时，Hermes 自动：

1. **注入提供商上下文**到系统提示（提供商知道什么）
2. **预取相关内存**在每轮之前（后台、非阻塞）
3. **同步对话轮次**到提供商在每个响应后
4. **在会话结束时提取内存**（对于支持的提供商）
5. **镜像内置内存写入**到外部提供商
6. **添加提供商特定工具**以便 Agent 可以搜索、存储和管理内存

内置内存（MEMORY.md / USER.md）继续完全工作。外部提供商是加法的。

## 可用提供商

### Honcho

具有辩证 Q&A、语义搜索和持久结论的 AI 原生跨会话用户建模。

| | |
|---|---|
| **最适合** | 具有跨会话上下文的多 Agent 系统、用户 Agent 对齐 |
| **需要** | `pip install honcho-ai` + [API 密钥](https://app.honcho.dev) 或自托管实例 |
| **数据存储** | Honcho 云或自托管 |
| **成本** | Honcho 定价（云） / 免费（自托管） |

**工具：** `honcho_profile`（对等卡）、`honcho_search`（语义搜索）、`honcho_context`（LLM 合成）、`honcho_conclude`（存储事实）

**设置向导：**
```bash
hermes honcho setup        # （遗留命令）
# 或
hermes memory setup        # 选择 "honcho"
```

**配置：** `$HERMES_HOME/honcho.json`（profile 本地）或 `~/.honcho/config.json`（全局）。解析顺序：`$HERMES_HOME/honcho.json` > `~/.hermes/honcho.json` > `~/.honcho/config.json`。见 [config reference](https://github.com/hermes-ai/hermes-agent/blob/main/plugins/memory/honcho/README.md) 和 [Honcho 集成指南](https://docs.honcho.dev/v3/guides/integrations/hermes)。

<details>
<summary>关键配置选项</summary>

| 键 | 默认 | 描述 |
|-----|---------|-------------|
| `apiKey` | -- | 从 [app.honcho.dev](https://app.honcho.dev) 的 API 密钥 |
| `baseUrl` | -- | 自托管 Honcho 的基础 URL |
| `peerName` | -- | 用户对等身份 |
| `aiPeer` | host key | AI 对等身份（每个 profile 一个） |
| `workspace` | host key | 共享工作区 ID |
| `recallMode` | `hybrid` | `hybrid`（自动注入 + 工具）、`context`（仅注入）、`tools`（仅工具） |
| `observation` | all on | 每个对等 `observeMe`/`observeOthers` 布尔值 |
| `writeFrequency` | `async` | `async`、`turn`、`session` 或整数 N |
| `sessionStrategy` | `per-directory` | `per-directory`、`per-repo`、`per-session`、`global` |
| `dialecticReasoningLevel` | `low` | `minimal`、`low`、`medium`、`high`、`max` |
| `dialecticDynamic` | `true` | 按查询长度自动提升推理 |
| `messageMaxChars` | `25000` | 每条消息最大字符数（超过时分块） |

</details>

<details>
<summary>最小 honcho.json（云）</summary>

```json
{
  "apiKey": "your-key-from-app.honcho.dev",
  "hosts": {
    "hermes": {
      "enabled": true,
      "aiPeer": "hermes",
      "peerName": "your-name",
      "workspace": "hermes"
    }
  }
}
```

</details>

<details>
<summary>最小 honcho.json（自托管）</summary>

```json
{
  "baseUrl": "http://localhost:8000",
  "hosts": {
    "hermes": {
      "enabled": true,
      "aiPeer": "hermes",
      "peerName": "your-name",
      "workspace": "hermes"
    }
  }
}
```

</details>

:::tip 从 `hermes honcho` 迁移
如果你之前使用过 `hermes honcho setup`，你的配置和所有服务器端数据都是完整的。只需通过设置向导再次重新启用或手动设置 `memory.provider: honcho` 以通过新系统重新激活。
:::

**多 Agent / Profiles：**

每个 Hermes profile 获取自己的 Honcho AI 对等同时共享相同的工作区 — 所有 profiles 看到相同的用户表示，但每个 Agent 构建自己的身份和观察。

```bash
hermes profile create coder --clone   # 创建 honcho 对等 "coder"，从默认继承配置
```

什么 `--clone` 做：在 `honcho.json` 中创建 `hermes.coder` 主机块与 `aiPeer: "coder"`、共享 `workspace`、继承 `peerName`、`recallMode`、`writeFrequency`、`observation` 等。对等在 Honcho 中热切创建使其在第一条消息之前存在。

对于在 Honcho 设置之前创建的 profiles：

```bash
hermes honcho sync   # 扫描所有 profiles，为任何缺少的创建主机块
```

这从默认 `hermes` 主机块继承设置并为每个 profile 创建新 AI 对等。幂等 — 跳过已有主机块的 profiles。

<details>
<summary>完整 honcho.json 示例（多 profile）</summary>

```json
{
  "apiKey": "your-key",
  "workspace": "hermes",
  "peerName": "eri",
  "hosts": {
    "hermes": {
      "enabled": true,
      "aiPeer": "hermes",
      "workspace": "hermes",
      "peerName": "eri",
      "recallMode": "hybrid",
      "writeFrequency": "async",
      "sessionStrategy": "per-directory",
      "observation": {
        "user": { "observeMe": true, "observeOthers": true },
        "ai": { "observeMe": true, "observeOthers": true }
      },
      "dialecticReasoningLevel": "low",
      "dialecticDynamic": true,
      "dialecticMaxChars": 600,
      "messageMaxChars": 25000,
      "saveMessages": true
    },
    "hermes.coder": {
      "enabled": true,
      "aiPeer": "coder",
      "workspace": "hermes",
      "peerName": "eri",
      "recallMode": "tools",
      "observation": {
        "user": { "observeMe": true, "observeOthers": false },
        "ai": { "observeMe": true, "observeOthers": true }
      }
    },
    "hermes.writer": {
      "enabled": true,
      "aiPeer": "writer",
      "workspace": "hermes",
      "peerName": "eri"
    }
  },
  "sessions": {
    "/home/user/myproject": "myproject-main"
  }
}
```

</details>

见 [config reference](https://github.com/hermes-ai/hermes-agent/blob/main/plugins/memory/honcho/README.md) 和 [Honcho 集成指南](https://docs.honcho.dev/v3/guides/integrations/hermes)。


---

### OpenViking

由 Volcengine（字节跳动）的上下文数据库，带有文件系统风格知识层级、分层检索和自动内存提取成 6 个类别。

| | |
|---|---|
| **最适合** | 具有结构化浏览的自托管知识管理 |
| **需要** | `pip install openviking` + 运行服务器 |
| **数据存储** | 自托管（本地或云） |
| **成本** | 免费（开源，AGPL-3.0） |

**工具：** `viking_search`（语义搜索）、`viking_read`（分层：摘要/概览/完整）、`viking_browse`（文件系统导航）、`viking_remember`（存储事实）、`viking_add_resource`（摄入 URL/文档）

**设置：**
```bash
# 首先启动 OpenViking 服务器
pip install openviking
openviking-server

# 然后配置 Hermes
hermes memory setup    # 选择 "openviking"
# 或手动：
hermes config set memory.provider openviking
echo "OPENVIKING_ENDPOINT=http://localhost:1933" >> ~/.hermes/.env
```

**关键功能：**
- 分层上下文加载：L0 (~100 tokens) → L1 (~2k) → L2（完整）
- 会话提交时自动内存提取（profile、偏好、实体、事件、案例、模式）
- `viking://` URI 方案用于层级知识浏览

---

### Mem0

服务器端 LLM 事实提取与语义搜索、重排名和自动去重。

| | |
|---|---|
| **最适合** | 动手内存管理 — Mem0 自动处理提取 |
| **需要** | `pip install mem0ai` + API 密钥 |
| **数据存储** | Mem0 云 |
| **成本** | Mem0 定价 |

**工具：** `mem0_profile`（所有存储的内存）、`mem0_search`（语义搜索 + 重排名）、`mem0_conclude`（存储逐字事实）

**设置：**
```bash
hermes memory setup    # 选择 "mem0"
# 或手动：
hermes config set memory.provider mem0
echo "MEM0_API_KEY=your-key" >> ~/.hermes/.env
```

**配置：** `$HERMES_HOME/mem0.json`

| 键 | 默认 | 描述 |
|-----|---------|-------------|
| `user_id` | `hermes-user` | 用户标识符 |
| `agent_id` | `hermes` | Agent 标识符 |

---

### Hindsight

具有知识图、实体解析和多策略检索的长期内存。`hindsight_reflect` 工具提供没有其他提供商提供的跨内存合成。自动保留完整对话轮次（包括工具调用）与会话级文档跟踪。

| | |
|---|---|
| **最适合** | 基于知识图的回忆与实体关系 |
| **需要** | 云：API 密钥从 [ui.hindsight.vectorize.io](https://ui.hindsight.vectorize.io)。本地：LLM API 密钥（OpenAI、Groq、OpenRouter 等） |
| **数据存储** | Hindsight 云或本地嵌入式 PostgreSQL |
| **成本** | Hindsight 定价（云）或免费（本地） |

**工具：** `hindsight_retain`（带实体提取的存储）、`hindsight_recall`（多策略搜索）、`hindsight_reflect`（跨内存合成）

**设置：**
```bash
hermes memory setup    # 选择 "hindsight"
# 或手动：
hermes config set memory.provider hindsight
echo "HINDSIGHT_API_KEY=your-key" >> ~/.hermes/.env
```

设置向导自动安装依赖并仅安装所需的所选模式（`hindsight-client` 用于云，`hindsight-all` 用于本地）。需要 `hindsight-client >= 0.4.22`（如果过期会自动升级）。

**本地模式 UI：** `hindsight-embed -p hermes ui start`

**配置：** `$HERMES_HOME/hindsight/config.json`

| 键 | 默认 | 描述 |
|-----|---------|-------------|
| `mode` | `cloud` | `cloud` 或 `local` |
| `bank_id` | `hermes` | 内存库标识符 |
| `recall_budget` | `mid` | 回忆彻底性：`low` / `mid` / `high` |
| `memory_mode` | `hybrid` | `hybrid`（上下文 + 工具）、`context`（仅自动注入）、`tools`（仅工具） |
| `auto_retain` | `true` | 自动保留对话轮次 |
| `auto_recall` | `true` | 每轮之前自动回忆内存 |
| `retain_async` | `true` | 在服务器上异步处理保留 |
| `tags` | — | 存储内存时应用的标签 |
| `recall_tags` | — | 回忆时过滤的标签 |

见 [plugin README](https://github.com/NousResearch/hermes-agent/blob/main/plugins/memory/hindsight/README.md) 了解完整配置参考。

---

### Holographic

具有 FTS5 全文搜索、信任评分和 HRR（全息简化表示）用于组合代数查询的本地 SQLite 事实存储。

| | |
|---|---|
| **最适合** | 具有高级检索的仅本地内存，无外部依赖 |
| **需要** | 无（SQLite 总是可用）。NumPy 可选用于 HRR 代数。 |
| **数据存储** | 本地 SQLite |
| **成本** | 免费 |

**工具：** `fact_store`（9 个动作：add、search、probe、related、reason、contradict、update、remove、list）、`fact_feedback`（有帮助/无帮助评级训练信任分数）

**设置：**
```bash
hermes memory setup    # 选择 "holographic"
# 或手动：
hermes config set memory.provider holographic
```

**配置：** 在 `config.yaml` 下 `plugins.hermes-memory-store`

| 键 | 默认 | 描述 |
|-----|---------|-------------|
| `db_path` | `$HERMES_HOME/memory_store.db` | SQLite 数据库路径 |
| `auto_extract` | `false` | 会话结束时自动提取事实 |
| `default_trust` | `0.5` | 默认信任分数（0.0–1.0） |

**独特能力：**
- `probe` — 实体特定代数回忆（某个人/事物的所有事实）
- `reason` — 跨多个实体的组合 AND 查询
- `contradict` — 冲突事实的自动检测
- 信任评分与不对称反馈（+0.05 有帮助 / -0.10 无帮助）

---

### RetainDB

具有混合搜索（向量 + BM25 + 重排名）、7 种内存类型和增量压缩的云内存 API。

| | |
|---|---|
| **最适合** | 已经使用 RetainDB 基础设施的团队 |
| **需要** | RetainDB 账户 + API 密钥 |
| **数据存储** | RetainDB 云 |
| **成本** | $20/月 |

**工具：** `retaindb_profile`（用户 profile）、`retaindb_search`（语义搜索）、`retaindb_context`（任务相关上下文）、`retaindb_remember`（带类型 + 重要性的存储）、`retaindb_forget`（删除内存）

**设置：**
```bash
hermes memory setup    # 选择 "retaindb"
# 或手动：
hermes config set memory.provider retaindb
echo "RETAINDB_API_KEY=your-key" >> ~/.hermes/.env
```

---

### ByteRover

通过 `brv` CLI 的持久内存 — 具有分层检索（模糊文本 → LLM 驱动搜索）的层级知识树。本地优先与可选云同步。

| | |
|---|---|
| **最适合** | 想要便携本地优先内存与 CLI 的开发者 |
| **需要** | ByteRover CLI (`npm install -g byterover-cli` 或 [install script](https://byterover.dev)) |
| **数据存储** | 本地（默认）或 ByteRover 云（可选同步） |
| **成本** | 免费（本地）或 ByteRover 定价（云） |

**工具：** `brv_query`（搜索知识树）、`brv_curate`（存储事实/决策/模式）、`brv_status`（CLI 版本 + 树统计）

**设置：**
```bash
# 首先安装 CLI
curl -fsSL https://byterover.dev/install.sh | sh

# 然后配置 Hermes
hermes memory setup    # 选择 "byterover"
# 或手动：
hermes config set memory.provider byterover
```

**关键功能：**
- 自动前压缩提取（在上下文压缩丢弃前保存见解）
- 知识树存储在 `$HERMES_HOME/byterover/`（profile 限定）
- SOC2 Type II 认证云同步（可选）

---

### Supermemory

具有 profile 回忆、语义搜索、显式内存工具和会话结束对话摄入通过 Supermemory 图 API 的语义长期内存。

| | |
|---|---|
| **最适合** | 具有用户 profiling 和会话级图构建的语义回忆 |
| **需要** | `pip install supermemory` + [API 密钥](https://supermemory.ai) |
| **数据存储** | Supermemory 云 |
| **成本** | Supermemory 定价 |

**工具：** `supermemory_store`（保存显式内存）、`supermemory_search`（语义相似性搜索）、`supermemory_forget`（按 ID 或最佳匹配查询遗忘）、`supermemory_profile`（持久 profile + 最近上下文）

**设置：**
```bash
hermes memory setup    # 选择 "supermemory"
# 或手动：
hermes config set memory.provider supermemory
echo 'SUPERMEMORY_API_KEY=***' >> ~/.hermes/.env
```

**配置：** `$HERMES_HOME/supermemory.json`

| 键 | 默认 | 描述 |
|-----|---------|-------------|
| `container_tag` | `hermes` | 用于搜索和写入的容器标签。支持 `{identity}` 模板用于 profile 限定标签。 |
| `auto_recall` | `true` | 轮次前注入相关内存上下文 |
| `auto_capture` | `true` | 每个响应后存储清除用户 Assistant 轮次 |
| `max_recall_results` | `10` | 要格式化进上下文的最大回忆项 |
| `profile_frequency` | `50` | 在第一轮和每 N 轮包括 profile 事实 |
| `capture_mode` | `all` | 默认跳过微小或微不足道的轮次 |
| `search_mode` | `hybrid` | 搜索模式：`hybrid`、`memories` 或 `documents` |
| `api_timeout` | `5.0` | SDK 和摄入请求的超时 |

**环境变量：** `SUPERMEMORY_API_KEY`（必需）、`SUPERMEMORY_CONTAINER_TAG`（覆盖配置）。

**关键功能：**
- 自动上下文围栏 — 从捕获的轮次中除去回忆的内存以防止递归内存污染
- 用于更丰富的图级知识构建的会话结束对话摄入
- 第一轮和可配置间隔时注入的 Profile 事实
- 微不足道的消息过滤（跳过 "ok"、"thanks" 等）
- **Profile 限定容器** — 在 `container_tag` 中使用 `{identity}`（例如 `hermes-{identity}` → `hermes-coder`）以隔离内存每个 Hermes profile
- **多容器模式** — 启用 `enable_custom_container_tags` 与 `custom_containers` 列表让 Agent 跨命名容器读/写。自动操作（同步、预取）停留在主容器。

<details>
<summary>多容器示例</summary>

```json
{
  "container_tag": "hermes",
  "enable_custom_container_tags": true,
  "custom_containers": ["project-alpha", "shared-knowledge"],
  "custom_container_instructions": "使用 project-alpha 用于编码上下文。"
}
```

</details>

**支持：** [Discord](https://supermemory.link/discord) · [support@supermemory.com](mailto:support@supermemory.com)

---

## 提供商比较

| 提供商 | 存储 | 成本 | 工具 | 依赖 | 独特功能 |
|----------|---------|------|-------|-------------|----------------|
| **Honcho** | 云 | 付费 | 4 | `honcho-ai` | 辩证用户建模 |
| **OpenViking** | 自托管 | 免费 | 5 | `openviking` + 服务器 | 文件系统层级 + 分层加载 |
| **Mem0** | 云 | 付费 | 3 | `mem0ai` | 服务器端 LLM 提取 |
| **Hindsight** | 云/本地 | 免费/付费 | 3 | `hindsight-client` | 知识图 + reflect 合成 |
| **Holographic** | 本地 | 免费 | 2 | 无 | HRR 代数 + 信任评分 |
| **RetainDB** | 云 | $20/mo | 5 | `requests` | 增量压缩 |
| **ByteRover** | 本地/云 | 免费/付费 | 3 | `brv` CLI | 前压缩提取 |
| **Supermemory** | 云 | 付费 | 4 | `supermemory` | 上下文围栏 + 会话图摄入 + 多容器 |

## Profile 隔离

每个提供商的数据对 [profile](/docs/user-guide/profiles) 隔离：

- **本地存储提供商**（Holographic、ByteRover）使用不同每个 profile 的 `$HERMES_HOME/` 路径
- **配置文件提供商**（Honcho、Mem0、Hindsight、Supermemory）在 `$HERMES_HOME/` 中存储配置使每个 profile 有自己的凭证
- **云提供商**（RetainDB）自动导出 profile 限定项目名称
- **环境变量提供商**（OpenViking）通过每个 profile 的 `.env` 文件配置

## 构建内存提供商

见 [Developer Guide: Memory Provider Plugins](/docs/developer-guide/memory-provider-plugin) 了解如何创建你自己的。
