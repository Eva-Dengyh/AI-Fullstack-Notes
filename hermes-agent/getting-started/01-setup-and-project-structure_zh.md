# Hermes Agent 教程（1）：本地启动与项目结构

项目地址：[https://github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)

## 启动项目

### Step 1：拉取项目到本地

```bash
git clone https://github.com/NousResearch/hermes-agent.git
```

### Step 2：进入项目目录

```bash
cd hermes-agent
```

若你放在固定路径，也可使用绝对路径，例如：

```bash
cd /Users/YolieDeng/Code/hermes-agent
```

### Step 3：创建并进入虚拟环境

```bash
uv venv
source .venv/bin/activate
```

### Step 4：安装项目依赖

```bash
uv sync
```

### Step 5：配置 `.env`

```bash
cp .env.example .env
```

编辑 `.env`，填入你的 API 密钥。例如使用 MiniMax：

```bash
# MINIMAX_API_KEY=your-key-here
```

### Step 6：模型选择与启动

```bash
hermes doctor
# 选择适合的模型
hermes model
hermes
```

成功启动后，终端会出现交互界面，即可开始对话。

## 项目结构讲解

```text
hermes-agent/
     │
     ├── 📁 核心框架模块
     │   ├── agent/                              # Agent 核心逻辑和执行引擎
     │   ├── gateway/                            # API 网关、请求路由、钩子系统
     │   │   ├── builtin_hooks/                  # 内置钩子集合
     │   │   └── platforms/                      # 多平台适配
     │   ├── hermes_cli/                         # CLI 命令行接口
     │   └── tools/                              # 工具系统和工具调用解析器
     │       ├── browser_providers/              # 浏览器供应商
     │       ├── environments/                   # 工具环境配置
     │       └── neutts_samples/                 # 神经 TTS 示例
     │
     ├── 📁 配置与适配
     │   ├── acp_adapter/                        # ACP 协议适配器
     │   ├── acp_registry/                       # 服务注册表
     │   ├── plugins/                            # 插件系统
     │   │   └── memory/                         # 内存/记忆插件
     │   │       ├── byterover/                  # Byterover 内存实现
     │   │       ├── hindsight/                  # Hindsight 内存实现
     │   │       ├── holographic/                # Holographic 内存实现
     │   │       ├── honcho/                     # Honcho 内存实现
     │   │       ├── mem0/                       # Mem0 内存实现
     │   │       ├── openviking/                 # OpenViking 内存实现
     │   │       ├── retaindb/                   # RetainDB 内存实现
     │   │       └── supermemory/                # SuperMemory 内存实现
     │   └── environments/                       # 环境配置和管理
     │       ├── benchmarks/                     # 基准测试环境
     │       │   ├── tblite/                     # TBLite 基准
     │       │   ├── terminalbench_2/            # 终端基准 2
     │       │   └── yc_bench/                   # YC 基准
     │       ├── hermes_swe_env/                 # Hermes SWE 环境
     │       ├── terminal_test_env/              # 终端测试环境
     │       └── tool_call_parsers/              # 工具调用解析器
     │
     ├── 📁 功能扩展 - Skills（完整技能列表）
     │   └── skills/                             # 完整技能模块集合
     │       │
     │       ├── 📂 苹果生态技能
     │       │   └── apple/
     │       │       ├── apple-notes/            # Apple Notes 集成
     │       │       ├── apple-reminders/        # Apple Reminders 集成
     │       │       ├── findmy/                 # Find My 定位服务
     │       │       └── imessage/               # iMessage 消息
     │       │
     │       ├── 📂 AI Agent 技能
     │       │   └── autonomous-ai-agents/
     │       │       ├── claude-code/            # Claude Code 集成
     │       │       ├── codex/                  # Codex AI 集成
     │       │       ├── hermes-agent/           # Hermes Agent 自身
     │       │       └── opencode/               # OpenCode 集成
     │       │
     │       ├── 📂 创意工具
     │       │   └── creative/
     │       │       ├── ascii-art/              # ASCII 艺术生成
     │       │       ├── ascii-video/            # ASCII 视频生成
     │       │       ├── excalidraw/             # Excalidraw 绘图
     │       │       ├── manim-video/            # Manim 视频制作
     │       │       ├── p5js/                   # P5.js 创意编程
     │       │       └── songwriting-and-ai-music/  # 作曲和 AI 音乐
     │       │
     │       ├── 📂 数据科学
     │       │   └── data-science/
     │       │       └── jupyter-live-kernel/    # Jupyter 实时内核
     │       │
     │       ├── 📂 运维和开发工具
     │       │   ├── devops/
     │       │   │   └── webhook-subscriptions/  # Webhook 订阅
     │       │   ├── diagramming/                # 图表工具
     │       │   └── domain/                     # 域名工具
     │       │
     │       ├── 📂 Email 工具
     │       │   └── email/
     │       │       └── himalaya/               # Himalaya 邮件客户端
     │       │
     │       ├── 📂 Feed 和 RSS
     │       │   └── feeds/                      # Feed 聚合工具
     │       │
     │       ├── 📂 游戏工具
     │       │   └── gaming/
     │       │       ├── minecraft-modpack-server/  # Minecraft 模组服务器
     │       │       └── pokemon-player/         # 宝可梦玩家工具
     │       │
     │       ├── 📂 GIF 工具
     │       │   └── gifs/                       # GIF 生成和处理
     │       │
     │       ├── 📂 GitHub 集成
     │       │   └── github/
     │       │       ├── codebase-inspection/    # 代码库检查
     │       │       ├── github-auth/            # GitHub 认证
     │       │       ├── github-code-review/     # 代码审查
     │       │       ├── github-issues/          # Issue 管理
     │       │       ├── github-pr-workflow/     # PR 工作流
     │       │       └── github-repo-management/ # 仓库管理
     │       │
     │       ├── 📂 索引和缓存
     │       │   └── index-cache/                # 索引缓存
     │       │
     │       ├── 📂 推理工具
     │       │   └── inference-sh/               # 推理 Shell 脚本
     │       │
     │       ├── 📂 休闲娱乐
     │       │   └── leisure/
     │       │       └── find-nearby/            # 附近地点查找
     │       │
     │       ├── 📂 MCP（模型上下文协议）
     │       │   └── mcp/
     │       │       ├── mcporter/               # MCP 转换器
     │       │       └── native-mcp/             # 原生 MCP 支持
     │       │
     │       ├── 📂 媒体工具
     │       │   └── media/
     │       │       ├── gif-search/             # GIF 搜索
     │       │       ├── heartmula/              # 音乐播放器
     │       │       ├── songsee/                # 歌曲识别
     │       │       └── youtube-content/        # YouTube 内容工具
     │       │
     │       ├── 📂 MLOps 工具
     │       │   └── mlops/
     │       │       ├── cloud/                  # 云平台工具
     │       │       ├── evaluation/             # 模型评估
     │       │       ├── huggingface-hub/        # HuggingFace 集成
     │       │       ├── inference/              # 模型推理
     │       │       ├── models/                 # 模型管理
     │       │       ├── research/               # 研究工具
     │       │       ├── training/               # 模型训练
     │       │       └── vector-databases/       # 向量数据库
     │       │
     │       ├── 📂 笔记应用
     │       │   └── note-taking/
     │       │       └── obsidian/               # Obsidian 笔记集成
     │       │
     │       ├── 📂 生产力工具
     │       │   └── productivity/
     │       │       ├── google-workspace/       # Google Workspace 集成
     │       │       ├── linear/                 # Linear 项目管理
     │       │       ├── nano-pdf/              # PDF 工具
     │       │       ├── notion/                 # Notion 集成
     │       │       ├── ocr-and-documents/      # OCR 和文档处理
     │       │       └── powerpoint/             # PowerPoint 制作
     │       │
     │       ├── 📂 红队工具
     │       │   └── red-teaming/
     │       │       └── godmode/                # GodMode 工具
     │       │
     │       ├── 📂 研究工具
     │       │   └── research/
     │       │       ├── arxiv/                  # ArXiv 论文
     │       │       ├── blogwatcher/            # 博客监控
     │       │       ├── llm-wiki/               # LLM Wiki
     │       │       ├── polymarket/             # Polymarket 数据
     │       │       └── research-paper-writing/ # 论文写作
     │       │
     │       ├── 📂 智能家居
     │       │   └── smart-home/
     │       │       └── openhue/                # OpenHue 智能灯控
     │       │
     │       ├── 📂 社交媒体
     │       │   └── social-media/
     │       │       └── xitter/                 # X/Twitter 集成
     │       │
     │       └── 📂 软件开发
     │           └── software-development/
     │               ├── plan/                   # 计划工具
     │               ├── requesting-code-review/ # 代码审查请求
     │               ├── subagent-driven-development/  # 子 Agent 驱动开发
     │               ├── systematic-debugging/   # 系统化调试
     │               ├── test-driven-development/  # TDD 工具
     │               └── writing-plans/          # 计划编写
     │
     ├── 📁 可选技能扩展
     │   └── optional-skills/                    # 可选安装的高级技能包
     │       │
     │       ├── 📂 自主 AI Agent
     │       │   └── autonomous-ai-agents/
     │       │       ├── blackbox/               # BlackBox AI
     │       │       └── honcho/                 # Honcho 框架
     │       │
     │       ├── 📂 区块链技能
     │       │   └── blockchain/
     │       │       ├── base/                   # Base 区块链
     │       │       └── solana/                 # Solana 链
     │       │
     │       ├── 📂 通信工具
     │       │   └── communication/
     │       │       └── one-three-one-rule/     # 一对一通信规则
     │       │
     │       ├── 📂 创意能力
     │       │   └── creative/
     │       │       ├── blender-mcp/            # Blender 3D 建模
     │       │       └── meme-generation/        # 梗图生成
     │       │
     │       ├── 📂 DevOps 高级工具
     │       │   └── devops/
     │       │       ├── cli/                    # DevOps CLI
     │       │       └── docker-management/      # Docker 管理
     │       │
     │       ├── 📂 邮件服务
     │       │   └── email/
     │       │       └── agentmail/              # Agent 邮件服务
     │       │
     │       ├── 📂 健康工具
     │       │   └── health/
     │       │       └── neuroskill-bci/         # 脑机接口工具
     │       │
     │       ├── 📂 MCP 工具
     │       │   └── mcp/
     │       │       └── fastmcp/                # FastMCP 框架
     │       │
     │       ├── 📂 数据迁移
     │       │   └── migration/
     │       │       └── openclaw-migration/     # OpenClaw 迁移工具
     │       │
     │       ├── 📂 MLOps 高级功能（17 个子模块）
     │       │   └── mlops/
     │       │       ├── accelerate/             # Hugging Face Accelerate
     │       │       ├── chroma/                 # Chroma 向量库
     │       │       ├── faiss/                  # Facebook FAISS
     │       │       ├── flash-attention/        # Flash Attention 优化
     │       │       ├── hermes-atropos-environments/  # Atropos 环境
     │       │       ├── huggingface-tokenizers/ # HF Tokenizers
     │       │       ├── instructor/             # Instructor 框架
     │       │       ├── lambda-labs/            # Lambda Labs GPU
     │       │       ├── llava/                  # LLaVA 多模态
     │       │       ├── nemo-curator/           # NeMo Curator
     │       │       ├── pinecone/               # Pinecone 向量 DB
     │       │       ├── pytorch-lightning/      # PyTorch Lightning
     │       │       ├── qdrant/                 # Qdrant 向量 DB
     │       │       ├── saelens/                # SAELENS 框架
     │       │       ├── simpo/                  # SimPO 训练
     │       │       ├── slime/                  # SLIME 框架
     │       │       ├── tensorrt-llm/           # TensorRT LLM
     │       │       └── torchtitan/             # TorchTitan 分布式
     │       │
     │       ├── 📂 生产力扩展
     │       │   └── productivity/
     │       │       ├── canvas/                 # Canvas 协作工具
     │       │       ├── memento-flashcards/     # 闪卡工具
     │       │       ├── siyuan/                 # 思源笔记
     │       │       └── telephony/              # 电话集成
     │       │
     │       ├── 📂 研究高级工具（7 个子模块）
     │       │   └── research/
     │       │       ├── bioinformatics/         # 生物信息学
     │       │       ├── domain-intel/           # 领域智能
     │       │       ├── duckduckgo-search/      # DuckDuckGo 搜索
     │       │       ├── gitnexus-explorer/      # Git 仓库浏览
     │       │       ├── parallel-cli/           # 并行 CLI
     │       │       ├── qmd/                    # Quarto Markdown
     │       │       └── scrapling/              # 网页爬虫
     │       │
     │       └── 📂 安全工具
     │           └── security/
     │               ├── 1password/              # 1Password 集成
     │               ├── oss-forensics/          # OSS 取证工具
     │               └── sherlock/               # Sherlock 用户搜索
     │
     ├── 📁 应用与前端
     │   ├── landingpage/                       # 落地页面
     │   └── website/                            # 项目官网
     │       ├── docs/                           # 网站文档
     │       │   ├── developer-guide/            # 开发者指南
     │       │   ├── getting-started/            # 入门指南
     │       │   ├── guides/                     # 使用指南
     │       │   ├── integrations/               # 集成文档
     │       │   ├── reference/                  # API 参考
     │       │   └── user-guide/                 # 用户指南
     │       ├── scripts/                        # 网站脚本
     │       ├── src/                            # 网站源代码
     │       │   ├── css/                        # 样式文件
     │       │   └── pages/                      # 页面组件
     │       └── static/                         # 静态资源
     │           └── img/                        # 图片资源
     │
     ├── 📁 测试与质量保证
     │   └── tests/                              # 完整测试套件
     │       ├── acp/                            # ACP 适配器测试
     │       ├── agent/                          # Agent 核心测试
     │       ├── cli/                            # CLI 测试
     │       ├── cron/                           # 定时任务测试
     │       ├── e2e/                            # 端到端测试
     │       ├── environments/                   # 环境测试
     │       │   └── benchmarks/                 # 基准测试
     │       ├── fakes/                          # Mock 和 Fake 对象
     │       ├── gateway/                        # 网关测试
     │       ├── hermes_cli/                     # CLI 测试
     │       ├── honcho_plugin/                  # Honcho 插件测试
     │       ├── integration/                    # 集成测试
     │       ├── plugins/                        # 插件测试
     │       │   └── memory/                     # 内存插件测试
     │       ├── run_agent/                      # Agent 运行测试
     │       ├── skills/                         # Skill 单元测试
     │       └── tools/                          # 工具测试
     │
     ├── 📁 构建与部署
     │   ├── docker/                             # Docker 配置
     │   ├── nix/                                # Nix 声明式配置
     │   ├── packaging/                          # 包管理配置
     │   │   └── homebrew/                       # Homebrew 公式
     │   ├── scripts/                            # 辅助脚本
     │   │   └── whatsapp-bridge/                # WhatsApp 桥接脚本
     │   └── docs/                               # 项目文档
     │       ├── migration/                      # 迁移文档
     │       ├── plans/                          # 规划文档
     │       └── skins/                          # 主题/皮肤文档
     │
     ├── 📁 项目资源
     │   ├── assets/                             # 静态资源（图片、图标）
     │   ├── plans/                              # 执行计划存储
     │   ├── datagen-config-examples/            # 数据生成示例配置
     │   └── tinker-atropos/                     # 实验性项目/工具
     │
     └── 📄 根目录核心文件
         ├── 🐍 主要 Python 模块
         │   ├── cli.py                          # 主 CLI 入口（约 410KB）
         │   ├── run_agent.py                    # Agent 执行引擎（约 500KB）
         │   ├── batch_runner.py                 # 批量任务运行器
         │   ├── rl_cli.py                       # 强化学习 CLI
         │   ├── mini_swe_runner.py              # 小型 SWE 运行器
         │   ├── mcp_serve.py                    # MCP 服务入口
         │   ├── trajectory_compressor.py        # 轨迹压缩工具
         │   ├── toolsets.py                     # 工具集管理
         │   ├── toolset_distributions.py        # 工具集分发
         │   ├── model_tools.py                  # 模型工具集
         │   ├── hermes_state.py                 # Agent 状态管理
         │   ├── hermes_logging.py               # 日志系统
         │   ├── hermes_time.py                  # 时间工具
         │   ├── hermes_constants.py             # 常量定义
         │   └── utils.py                        # 工具函数
         │
         ├── 📦 配置文件
         │   ├── pyproject.toml                  # Python 项目配置
         │   ├── requirements.txt                # Python 依赖
         │   ├── setup-hermes.sh                 # 安装脚本
         │   ├── flake.nix                       # Nix 开发环境
         │   ├── flake.lock                      # Nix 依赖锁定
         │   ├── package.json                    # Node.js 项目配置
         │   ├── package-lock.json               # Node.js 依赖锁定
         │   ├── uv.lock                         # UV 包管理器锁定文件
         │   ├── MANIFEST.in                     # 包清单
         │   └── constraints-termux.txt          # Termux 约束
         │
         ├── 🐳 部署配置
         │   └── Dockerfile                      # 容器镜像
         │
         ├── 📝 文档和示例
         │   ├── README.md                       # 项目自述文件
         │   ├── CONTRIBUTING.md                 # 贡献指南
         │   ├── AGENTS.md                       # Agent 文档
         │   ├── LICENSE                         # 许可证
         │   ├── cli-config.yaml.example         # CLI 配置示例
         │   └── RELEASE_v*.md                   # 发版说明
         │       ├── RELEASE_v0.2.0.md
         │       ├── RELEASE_v0.3.0.md
         │       ├── RELEASE_v0.4.0.md
         │       ├── RELEASE_v0.5.0.md
         │       ├── RELEASE_v0.6.0.md
         │       ├── RELEASE_v0.7.0.md
         │       └── RELEASE_v0.8.0.md
         │
         ├── 📂 开发工具
         │   ├── .env                            # 环境变量（本地配置）
         │   ├── .env.example                    # 环境变量模板
         │   ├── .envrc                          # direnv 配置
         │   ├── .gitignore                      # Git 忽略规则
         │   ├── .gitmodules                     # Git 子模块配置
         │   ├── .dockerignore                   # Docker 忽略规则
         │   └── .github/                        # GitHub Actions 配置
         │
         └── 📁 项目管理
             ├── .git/                           # Git 仓库
             ├── .plans/                         # Claude Code 计划
             ├── .venv/                          # Python 虚拟环境
             ├── __pycache__/                    # Python 缓存
             └── .idea/                          # IntelliJ IDEA 配置
```

> 说明：仓库体积与版本会变，上述树形结构用于建立整体心智模型；以你本地 `git clone` 后的实际目录为准。
