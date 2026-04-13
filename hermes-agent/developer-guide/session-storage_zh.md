# 会话存储

Hermes 的会话层基于 SQLite，并使用 FTS5 提供全文搜索。它既保存消息内容，也保存 session 元数据、lineage、标题和统计信息。

## 架构总览

会话存储承担的职责包括：

- 保存会话与消息；
- 支持按标题、平台和关键字检索；
- 跟踪压缩或 fork 后的 session lineage；
- 为 CLI、gateway 和其他入口提供统一历史层。

## SQLite Schema

### `sessions` 表

`sessions` 表记录会话级元数据，例如：

- 会话 id；
- 标题；
- 平台；
- 创建时间与结束时间；
- 父子 lineage 信息；
- 状态与统计信息。

### `messages` 表

`messages` 表保存逐条消息，通常包含：

- 所属 session；
- role；
- content；
- 顺序索引；
- token usage 或附加元数据；
- 工具调用相关字段。

### FTS5 全文搜索

FTS5 索引用于快速搜索消息内容。它通常与消息表联动更新，用于实现按关键词、平台和角色过滤的检索。

## Schema 版本与迁移

随着字段或索引变化，数据库 schema 会附带版本号。初始化和启动时会检查版本，并按需执行迁移逻辑。

## 写入争用处理

SQLite 在并发写场景下容易遇到锁竞争，因此 Hermes 会在写路径上做原子化和冲突处理，尽量保证：

- 不丢消息；
- 不产生半写入状态；
- 多入口同时访问时仍能稳定工作。

## 常见操作

### 初始化

首次启动时会创建数据库文件、基础表、索引和必要的 schema 元数据。

### 创建和管理会话

常见会话操作包括：

```python
# Create a new session
# End a session
# Reopen a session (clear ended_at/end_reason)
```

### 存储消息

每条消息写入时，通常会带上 role、内容、顺序以及必要的 provider / usage 元数据。工具回合也会被当作消息序列的一部分持久化。

### 读取消息

Hermes 一般支持两种读取模式：

- 原始消息格式：保留全部元数据，便于调试和内部重放；
- OpenAI 风格对话格式：便于直接回放给模型 API。

```python
# Raw messages with all metadata
# OpenAI conversation format (for API replay)
# Returns: [{"role": "user", "content": "..."}, {"role": "assistant", ...}]
```

### 会话标题

标题既可手动设置，也可自动生成，并要求在“未为空的标题集合”中保持唯一性，以便后续按标题恢复最近 lineage 会话。

```python
# Set a title (must be unique among non-NULL titles)
# Resolve by title (returns most recent in lineage)
# Auto-generate next title in lineage
```

## 全文搜索

### 基础搜索

最简单的用法是直接按关键字查询消息内容。

### FTS5 查询语法

如果需要更强的表达能力，可以使用 FTS5 支持的查询语法，例如词组、逻辑组合或前缀匹配。

### 带过滤条件的搜索

搜索通常还可以结合平台、角色或 session 条件一起使用：

```python
# Search only CLI sessions
# Exclude gateway sessions
# Search only user messages
```

### 搜索结果格式

结果一般会返回匹配片段、所属 session、时间戳和必要预览信息，便于直接在 UI 中展示。

## 会话 lineage

lineage 用来描述会话在压缩、分支或重开后的继承关系。

### 查询：查找 session lineage

可以按父子链追踪某次会话从原始对话到压缩后对话的演变。

### 查询：最近会话与预览

这类查询通常给 CLI / gateway 的会话列表页使用。

### 查询：token usage 统计

可按 session 或 lineage 汇总 token 使用情况，便于做调试、计费和性能分析。

## 导出与清理

Hermes 还提供数据导出与回收操作：

```python
# Export a single session with messages
# Export all sessions (with messages) as list of dicts
# Delete old sessions (only ended sessions)
# Clear messages but keep the session record
# Delete session and all messages
```

## 数据库位置

数据库位置通常由 Hermes 的 profile 感知路径机制决定，不应硬编码。实际代码中应通过统一的路径工具获取数据库文件位置。
