---
title: "轨迹格式"
description: "Hermes 如何保存对话轨迹：文件命名、JSONL 格式、ShareGPT conversations 和归一化规则。"
---

# 轨迹格式

Trajectory 用于保存 Agent 执行过程，供调试、评测、SFT 数据生成或训练使用。Hermes 通常把轨迹写成 JSONL，每一行是一条完整样本。

## 文件命名约定

轨迹文件名通常包含任务、时间戳、运行模式或成功状态等信息，以便批量处理时区分来源。

## JSONL 条目格式

### CLI / Interactive Format（来自 `_save_trajectory`）

交互式轨迹会记录用户输入、assistant 响应、工具调用、工具结果和必要元数据。

### Batch Runner Format（来自 `batch_runner.py`）

批处理轨迹通常还会包含任务 id、输入样本、评测结果、成功标记和批运行配置。

## Conversations Array（ShareGPT Format）

训练数据通常会被归一化成 ShareGPT 风格的 `conversations` 数组：

```json
[
  {"from": "human", "value": "User message"},
  {"from": "gpt", "value": "Assistant response"}
]
```

### 完整示例

完整样本通常包含：

- `conversations`
- `metadata`
- `success`
- `source`
- 工具调用或 reasoning 的归一化表示

## 归一化规则

### Reasoning Content Markup

如果模型输出包含 reasoning 内容，保存前会按训练格式要求进行标记或移除，避免污染最终 assistant 回复。

### Tool Call Normalization

工具调用会被转成统一表示，便于不同 provider 的轨迹合并使用。

### Tool Response Normalization

工具响应也会做标准化，确保训练数据中工具结果的格式一致。

### System Message

系统消息通常需要谨慎处理。训练数据可能保留、裁剪或完全移除 system prompt，取决于目标训练任务。

## 加载轨迹

常见加载逻辑包括：

```python
# Filter to successful completions only
# Extract just the conversations for training
```

### 为 HuggingFace Datasets 加载

轨迹 JSONL 可以转换成 HuggingFace Datasets 可读格式，用于训练或分析。

## 控制轨迹保存

轨迹保存通常由配置开关控制：

```yaml
# config.yaml
```

建议在调试、评测和数据生成时开启，在普通用户运行时按需关闭，以避免保存过多敏感上下文。
