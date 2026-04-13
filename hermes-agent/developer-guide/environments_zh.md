---
title: "环境、评测与数据生成"
description: "Hermes 的 benchmark、训练环境、SFT 数据生成和 RL 训练入口。"
---

# 环境、评测与数据生成

Hermes 包含一套面向评测、SFT 数据生成和 RL 训练的环境层。它把 `AIAgent` 包装进可重复运行的 benchmark 或 training runtime 中，并把执行轨迹保存为训练数据。

## 架构

### BaseEnv（Atropos）

`BaseEnv` 来自 Atropos 生态，提供训练环境的基础协议。

### HermesAgentBaseEnv

Hermes 在其上封装了 `AIAgent`，让同一套 Agent 能在评测、数据生成和 RL server 模式下运行。

### 具体环境

具体环境会定义任务来源、奖励或成功判定、工具上下文和输出格式。

## 核心组件

### Agent Loop

环境最终仍调用 Hermes 的 Agent loop，因此 provider、工具、压缩和会话逻辑与普通运行路径保持一致。

### Tool Context

环境可以为 Agent 注入特定工具上下文，例如沙箱目录、任务文件、评测约束和可用命令。

### Tool Call Parsers

不同 benchmark 可能对工具调用格式有要求，因此环境层会提供解析和标准化逻辑。

## 可用 Benchmark

### TerminalBench2

TerminalBench2 面向终端任务评测，通常在受控 sandbox 中运行。

```bash
# Run specific tasks
```

### TBLite（OpenThoughts Terminal Bench Lite）

TBLite 是更轻量的终端 benchmark，适合快速验证能力和回归。

### YC-Bench

YC-Bench 用于更特定的任务集合。

```bash
# Install yc-bench (optional dependency)
# Run evaluation
# Or directly
# Quick single-preset test
```

## 训练环境

### TerminalTestEnv

用于终端任务的训练或数据生成环境。

```bash
# Process mode (saves rollouts to JSONL, no training server needed)
# Serve mode (connects to Atropos API for RL training)
```

### HermesSweEnv

面向软件工程任务的环境，通常会包含仓库操作、测试执行和补丁生成。

## 运行环境

### `evaluate`：运行 benchmark

用于直接对模型或 provider 配置做评测。

### `process`：生成 SFT 数据

运行任务并把轨迹保存为 JSONL，便于后续监督微调。

### `serve`：连接 Atropos 做 RL 训练

```bash
# Terminal 1: Start the Atropos API
# Terminal 2: Start the environment
```

## 两阶段运行

### 阶段 1：OpenAI Server（Eval / SFT）

评测和 SFT 数据生成通常只需要 OpenAI 风格 server 或 provider endpoint。

### 阶段 2：VLLM ManagedServer（完整 RL）

完整 RL 训练可能需要 vLLM managed server、Atropos API 和环境服务协同运行。

## 创建环境

### 训练环境

训练环境需要定义观测、动作、奖励、终止条件和轨迹输出。

### 仅评测 Benchmark

只做评测时，可以省略训练 server 相关逻辑，只实现任务加载、执行和评分。

## 配置参考

### `HermesAgentEnvConfig` 字段

配置通常包括模型、provider、工具、任务路径、输出路径、并发数和 sandbox 设置。

### YAML 配置

复杂环境推荐使用 YAML 文件保存配置，便于复现实验。

## 前置要求

### 所有环境

需要能运行 Hermes Agent，且至少配置一个可用 provider。

### Modal sandbox benchmark（TB2、TBLite）

需要 Modal 相关依赖和认证。

### YC-Bench

需要安装 benchmark 的可选依赖。

### RL 训练

需要 Atropos、训练 server、模型服务和足够的计算资源。

## 目录结构

环境相关代码通常位于：

- `environments/`
- `agent/trajectory.py`
- `batch_runner.py`
- benchmark 专属目录或依赖包

轨迹格式见 [Trajectory Format](./trajectory-format_zh.md)。
