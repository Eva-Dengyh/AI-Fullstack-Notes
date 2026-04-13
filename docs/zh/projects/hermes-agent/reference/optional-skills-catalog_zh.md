---
sidebar_position: 9
title: "可选技能目录"
description: "hermes-agent 随仓库提供的官方可选技能，可通过 hermes skills install official/<category>/<skill> 安装"
---

# 可选技能目录

官方可选技能随 hermes-agent 仓库一起提供，位于 `optional-skills/` 下，但 **默认不会启用**。需要显式安装：

```bash
hermes skills install official/<category>/<skill>
```

例如：

```bash
hermes skills install official/blockchain/solana
hermes skills install official/mlops/flash-attention
```

安装后，该技能会出现在 agent 的技能列表中，并在检测到相关任务时自动加载。

卸载命令：

```bash
hermes skills uninstall <skill-name>
```

---

## Autonomous AI Agents

| 技能 | 说明 |
|-------|-------------|
| **blackbox** | 将编码任务委派给 Blackbox AI CLI agent。它是多模型 agent，内置裁判，会把任务交给多个 LLM，再选出最佳结果。 |
| **honcho** | 在 Hermes 中配置并使用 Honcho 记忆能力，包括跨会话用户建模、多 profile 同级隔离、观察配置与辩证式推理。 |

## Blockchain

| 技能 | 说明 |
|-------|-------------|
| **base** | 查询 Base（Ethereum L2）链上数据并换算 USD 价格，包括钱包余额、代币信息、交易详情、Gas 分析、合约检查、鲸鱼识别与实时网络统计。无需 API Key。 |
| **solana** | 查询 Solana 链上数据并换算 USD 价格，包括钱包余额、代币资产组合、交易详情、NFT、鲸鱼识别与实时网络统计。无需 API Key。 |

## Communication

| 技能 | 说明 |
|-------|-------------|
| **one-three-one-rule** | 用于提案和决策的结构化沟通框架。 |

## Creative

| 技能 | 说明 |
|-------|-------------|
| **blender-mcp** | 通过与 blender-mcp 插件建立 socket 连接，直接从 Hermes 控制 Blender。可创建 3D 对象、材质、动画，并执行任意 Blender Python（bpy）代码。 |
| **meme-generation** | 选择模板并用 Pillow 叠加文字，生成真正的梗图图片。输出实际的 `.png` 文件。 |

## DevOps

| 技能 | 说明 |
|-------|-------------|
| **cli** | 通过 inference.sh CLI（infsh）运行 150+ 个 AI 应用，包括图像生成、视频创作、LLM、搜索、3D 和社交自动化。 |
| **docker-management** | 管理 Docker 容器、镜像、卷、网络与 Compose 栈，覆盖生命周期操作、调试、清理和 Dockerfile 优化。 |

## Email

| 技能 | 说明 |
|-------|-------------|
| **agentmail** | 为 agent 提供独立的电子邮箱收件箱。借助 AgentMail，agent 可以使用自己拥有的邮箱地址自主收发和管理邮件。 |

## Health

| 技能 | 说明 |
|-------|-------------|
| **neuroskill-bci** | 为神经科学研究工作流提供脑机接口（BCI）集成能力。 |

## MCP

| 技能 | 说明 |
|-------|-------------|
| **fastmcp** | 使用 Python 中的 FastMCP 构建、测试、检查、安装和部署 MCP 服务器。覆盖将 API 或数据库包装成 MCP 工具、暴露 resources 或 prompts，以及部署流程。 |

## Migration

| 技能 | 说明 |
|-------|-------------|
| **openclaw-migration** | 将用户的 OpenClaw 定制化资产迁移到 Hermes Agent，包括 memories、SOUL.md、命令白名单、用户技能和选定的工作区资源。 |

## MLOps

这是最大的可选技能类别，覆盖从数据整理到生产推理的完整机器学习流水线。

| 技能 | 说明 |
|-------|-------------|
| **accelerate** | 最简单的分布式训练 API。只需 4 行代码即可为任意 PyTorch 脚本添加分布式支持。统一封装 DeepSpeed / FSDP / Megatron / DDP。 |
| **chroma** | 开源向量嵌入数据库。可存储 embedding 与元数据，执行向量检索和全文搜索。为 RAG 与语义搜索提供简洁的 4 函数 API。 |
| **faiss** | Facebook 的高效相似度搜索与稠密向量聚类库。支持数十亿向量、GPU 加速以及多种索引类型（Flat、IVF、HNSW）。 |
| **flash-attention** | 使用 Flash Attention 优化 Transformer 注意力计算，带来 2 到 4 倍速度提升与 10 到 20 倍显存节省。支持 PyTorch SDPA、flash-attn、H100 FP8 和滑动窗口。 |
| **hermes-atropos-environments** | 构建、测试并调试 Hermes Agent 的 Atropos RL 环境。覆盖 HermesAgentBaseEnv 接口、奖励函数、agent loop 集成与评估。 |
| **huggingface-tokenizers** | 面向研究和生产环境的高性能 Rust tokenizer。1GB 文本可在 20 秒内完成分词。支持 BPE、WordPiece 与 Unigram。 |
| **instructor** | 使用 Pydantic 校验从 LLM 回复中提取结构化数据；自动重试失败的提取，并可流式输出部分结果。 |
| **lambda-labs** | 面向 ML 训练与推理的预留式与按需 GPU 云实例。支持 SSH 访问、持久文件系统与多节点集群。 |
| **llava** | Large Language and Vision Assistant，多模态视觉指令微调与图像对话模型，将 CLIP 视觉编码器与 LLaMA 语言模型结合。 |
| **nemo-curator** | 面向 LLM 训练的数据整理工具，支持 GPU 加速。提供模糊去重（快 16 倍）、质量过滤（30+ 启发式规则）、语义去重与 PII 脱敏，并可借助 RAPIDS 扩展。 |
| **pinecone** | 面向生产 AI 的托管向量数据库。支持自动扩缩容、混合检索（稠密 + 稀疏）、元数据过滤和低延迟（p95 小于 100ms）。 |
| **pytorch-lightning** | 高层 PyTorch 框架，提供 Trainer、自动分布式训练（DDP/FSDP/DeepSpeed）、回调系统，以及极少样板代码。 |
| **qdrant** | 高性能向量相似度搜索引擎。基于 Rust，支持快速近邻搜索、带过滤条件的混合检索以及可扩展向量存储。 |
| **saelens** | 使用 SAELens 训练和分析稀疏自编码器（SAE），将神经网络激活分解为可解释特征。 |
| **simpo** | Simple Preference Optimization，是 DPO 的无参考模型替代方案，效果更好（在 AlpacaEval 2.0 上高出 6.4 分）。无需参考模型。 |
| **slime** | 使用 Megatron + SGLang 框架进行基于 RL 的 LLM 后训练。支持自定义数据生成工作流，并与 Megatron-LM 紧密集成以实现 RL 扩展。 |
| **tensorrt-llm** | 使用 NVIDIA TensorRT 优化 LLM 推理，获得最大吞吐。相较 PyTorch，在 A100/H100 上可快 10 到 100 倍，并支持量化（FP8/INT4）和 in-flight batching。 |
| **torchtitan** | 原生 PyTorch 的分布式 LLM 预训练工具，支持 4D 并行（FSDP2、TP、PP、CP）。可从 8 张 GPU 扩展到 512+ GPU，支持 Float8 与 `torch.compile`。 |

## Productivity

| 技能 | 说明 |
|-------|-------------|
| **canvas** | Canvas LMS 集成，通过 API Token 获取已选课程和作业信息。 |
| **memento-flashcards** | 基于间隔重复的抽认卡系统，用于学习与知识保持。 |
| **siyuan** | SiYuan Note API，可在自托管知识库中搜索、读取、创建和管理 block 与文档。 |
| **telephony** | 赋予 Hermes 电话能力，包括开通 Twilio 号码、收发 SMS/MMS、拨打电话，以及通过 Bland.ai 或 Vapi 发起 AI 外呼。 |

## Research

| 技能 | 说明 |
|-------|-------------|
| **bioinformatics** | 对接 bioSkills 与 ClawBio 的 400+ 生物信息学技能，覆盖基因组学、转录组学、单细胞、变异检测、药物基因组学、宏基因组学与结构生物学。 |
| **domain-intel** | 基于 Python 标准库的被动式域名侦察。支持子域发现、SSL 证书检查、WHOIS 查询、DNS 记录与批量多域分析。无需 API Key。 |
| **duckduckgo-search** | 通过 DuckDuckGo 做免费网页搜索，支持文本、新闻、图片和视频。无需 API Key。 |
| **gitnexus-explorer** | 使用 GitNexus 为代码库建立索引，并通过 Web UI 与 Cloudflare tunnel 提供交互式知识图谱。 |
| **parallel-cli** | Parallel CLI 的厂商技能，提供 agent 原生网页搜索、提取、深度研究、富化与监控能力。 |
| **qmd** | 使用 qmd 在本地搜索个人知识库、笔记、文档与会议记录。它是一个结合 BM25、向量搜索与 LLM 重排的混合检索引擎。 |
| **scrapling** | 基于 Scrapling 的网页抓取技能，覆盖 HTTP 抓取、隐身浏览器自动化、Cloudflare 绕过，以及通过 CLI 和 Python 进行 spider 爬取。 |

## Security

| 技能 | 说明 |
|-------|-------------|
| **1password** | 配置并使用 1Password CLI（`op`）。覆盖安装 CLI、启用桌面应用集成、登录，以及为命令读取或注入密钥。 |
| **oss-forensics** | 开源软件取证，分析软件包、依赖项及供应链风险。 |
| **sherlock** | 在 400+ 个社交网络上做 OSINT 用户名搜索，按用户名追踪社交媒体账号。 |

---

## 贡献可选技能

向仓库添加新的可选技能时：

1. 在 `optional-skills/<category>/<skill-name>/` 下创建目录
2. 添加包含标准 frontmatter（name、description、version、author）的 `SKILL.md`
3. 将支持文件放入 `references/`、`templates/` 或 `scripts/` 子目录
4. 提交 pull request；合并后，该技能就会出现在本目录中
