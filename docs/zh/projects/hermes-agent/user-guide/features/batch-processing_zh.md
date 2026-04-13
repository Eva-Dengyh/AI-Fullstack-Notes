---
sidebar_position: 12
title: "批处理"
description: "大规模生成代理轨迹 — 并行处理、检查点和工具集分布"
---

# 批处理

批处理让你在并行运行 Hermes 代理处理数百或数千个提示，生成结构化的轨迹数据。这主要用于 **训练数据生成** — 生成具有工具使用统计的 ShareGPT 格式轨迹，可用于微调或评估。

## 概述

批处理运行器（`batch_runner.py`）处理 JSONL 格式的提示数据集，通过完整的代理会话运行每个提示并具有工具访问权限。每个提示获得自己的隔离环境。输出是结构化的轨迹数据，包含完整的对话历史、工具调用统计和推理覆盖指标。

## 快速开始

```bash
# 基本批处理运行
python batch_runner.py \
    --dataset_file=data/prompts.jsonl \
    --batch_size=10 \
    --run_name=my_first_run \
    --model=anthropic/claude-sonnet-4.6 \
    --num_workers=4

# 恢复中断的运行
python batch_runner.py \
    --dataset_file=data/prompts.jsonl \
    --batch_size=10 \
    --run_name=my_first_run \
    --resume

# 列出可用工具集分布
python batch_runner.py --list_distributions
```

## 数据集格式

输入数据集是 JSONL 文件（每行一个 JSON 对象）。每个条目必须有 `prompt` 字段：

```jsonl
{"prompt": "Write a Python function that finds the longest palindromic substring"}
{"prompt": "Create a REST API endpoint for user authentication using Flask"}
{"prompt": "Debug this error: TypeError: cannot unpack non-iterable NoneType object"}
```

条目可选包含：
- `image` 或 `docker_image`：用于此提示沙盒的容器镜像（适用于 Docker、Modal 和 Singularity 后端）
- `cwd`：任务终端会话的工作目录覆盖

## 配置选项

| 参数 | 默认值 | 描述 |
|------|--------|------|
| `--dataset_file` | （必需） | JSONL 数据集路径 |
| `--batch_size` | （必需） | 每个批次的提示数 |
| `--run_name` | （必需） | 此运行的名称（用于输出目录和检查点） |
| `--distribution` | `"default"` | 要采样的工具集分布 |
| `--model` | `claude-sonnet-4.6` | 要使用的模型 |
| `--base_url` | `https://openrouter.ai/api/v1` | API 基础 URL |
| `--api_key` | （环境变量） | 模型的 API 密钥 |
| `--max_turns` | `10` | 每个提示的最大工具调用迭代数 |
| `--num_workers` | `4` | 并行工作进程数 |
| `--resume` | `false` | 从检查点恢复 |
| `--verbose` | `false` | 启用详细日志 |
| `--max_samples` | 全部 | 仅处理数据集中的前 N 个样本 |
| `--max_tokens` | 模型默认值 | 每个模型响应的最大令牌数 |

### 提供商路由（OpenRouter）

| 参数 | 描述 |
|------|------|
| `--providers_allowed` | 逗号分隔的允许提供商列表（例如 `"anthropic,openai"`） |
| `--providers_ignored` | 逗号分隔的要忽略的提供商列表（例如 `"together,deepinfra"`） |
| `--providers_order` | 逗号分隔的首选提供商顺序 |
| `--provider_sort` | 按 `"price"`、`"throughput"` 或 `"latency"` 排序 |

### 推理控制

| 参数 | 描述 |
|------|------|
| `--reasoning_effort` | 努力级别：`none`、`minimal`、`low`、`medium`、`high`、`xhigh` |
| `--reasoning_disabled` | 完全禁用推理/思考令牌 |

### 高级选项

| 参数 | 描述 |
|------|------|
| `--ephemeral_system_prompt` | 执行期间使用但NOT保存到轨迹的系统提示 |
| `--log_prefix_chars` | 日志预览中显示的字符数（默认：100） |
| `--prefill_messages_file` | 包含预填充消息的 JSON 文件路径，用于少量示例启发 |

## 工具集分布

每个提示从 **分布** 中获得随机采样的工具集。这确保训练数据涵盖多样的工具组合。使用 `--list_distributions` 查看所有可用分布。

在当前实现中，分布为 **每个单独工具集** 分配概率。采样器独立地翻转每个工具集，然后保证至少启用一个工具集。这与手动编写的预构建组合表不同。

## 输出格式

所有输出进入 `data/<run_name>/`：

```text
data/my_run/
├── trajectories.jsonl    # 组合最终输出（所有批次合并）
├── batch_0.jsonl         # 单个批次结果
├── batch_1.jsonl
├── ...
├── checkpoint.json       # 恢复检查点
└── statistics.json       # 聚合工具使用统计
```

### 轨迹格式

`trajectories.jsonl` 中的每一行都是 JSON 对象：

```json
{
  "prompt_index": 42,
  "conversations": [
    {"from": "human", "value": "Write a function..."},
    {"from": "gpt", "value": "I'll create that function...",
     "tool_calls": [...]},
    {"from": "tool", "value": "..."},
    {"from": "gpt", "value": "Here's the completed function..."}
  ],
  "metadata": {
    "batch_num": 2,
    "timestamp": "2026-01-15T10:30:00",
    "model": "anthropic/claude-sonnet-4.6"
  },
  "completed": true,
  "partial": false,
  "api_calls": 3,
  "toolsets_used": ["terminal", "file"],
  "tool_stats": {
    "terminal": {"count": 2, "success": 2, "failure": 0},
    "read_file": {"count": 1, "success": 1, "failure": 0}
  },
  "tool_error_counts": {
    "terminal": 0,
    "read_file": 0
  }
}
```

`conversations` 字段使用类似 ShareGPT 的格式，带有 `from` 和 `value` 字段。工具统计规范化为包括所有可能的工具，默认值为零，确保条目间架构一致，以便与 HuggingFace 数据集兼容。

## 检查点

批处理运行器具有强大的检查点用于容错：

- **检查点文件：** 在每个批次完成后保存，追踪哪些提示索引已完成
- **基于内容的恢复：** 在 `--resume` 时，运行器扫描现有批次文件并通过实际文本内容（不仅仅是索引）匹配已完成的提示，即使数据集顺序改变也能恢复
- **失败的提示：** 仅成功完成的提示被标记为完成 — 失败的提示在恢复时将重试
- **批次合并：** 完成时，所有批次文件（包括来自之前的运行）合并到单个 `trajectories.jsonl` 中

### 恢复如何工作

1. 扫描所有 `batch_*.jsonl` 文件以查找已完成的提示（通过内容匹配）
2. 过滤数据集以排除已完成的提示
3. 重新分批剩余提示
4. 仅处理剩余提示
5. 合并所有批次文件（旧 + 新）到最终输出

## 质量过滤

批处理运行器应用自动质量过滤：

- **无推理过滤：** 零个助手回合包含推理的样本（无 `<REASONING_SCRATCHPAD>` 或本地思考令牌）被丢弃
- **损坏条目过滤：** 在最终合并期间，具有幻觉工具名称（不在有效工具列表中）的条目被过滤
- **推理统计：** 跟踪整个运行中包含/不包含推理的回合百分比

## 统计

完成后，运行器打印综合统计：

- **工具使用：** 每个工具的调用计数、成功/失败率
- **推理覆盖：** 具有推理的助手回合百分比
- **丢弃样本：** 因缺乏推理而过滤的样本计数
- **持续时间：** 总处理时间

统计也保存到 `statistics.json` 用于程序化分析。

## 用例

### 训练数据生成

生成多样的工具使用轨迹用于微调：

```bash
python batch_runner.py \
    --dataset_file=data/coding_prompts.jsonl \
    --batch_size=20 \
    --run_name=coding_v1 \
    --model=anthropic/claude-sonnet-4.6 \
    --num_workers=8 \
    --distribution=default \
    --max_turns=15
```

### 模型评估

评估模型在标准化提示上的工具使用能力：

```bash
python batch_runner.py \
    --dataset_file=data/eval_suite.jsonl \
    --batch_size=10 \
    --run_name=eval_gpt4 \
    --model=openai/gpt-4o \
    --num_workers=4 \
    --max_turns=10
```

### 每提示容器镜像

对于需要特定环境的基准，每个提示可以指定自己的容器镜像：

```jsonl
{"prompt": "Install numpy and compute eigenvalues of a 3x3 matrix", "image": "python:3.11-slim"}
{"prompt": "Compile this Rust program and run it", "image": "rust:1.75"}
{"prompt": "Set up a Node.js Express server", "image": "node:20-alpine", "cwd": "/app"}
```

批处理运行器在运行每个提示前验证 Docker 镜像是否可访问。
