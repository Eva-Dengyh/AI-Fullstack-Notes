---
sidebar_position: 4
title: "贡献指南"
description: "如何为 Hermes Agent 做贡献：开发环境、代码风格与 PR 流程。"
---

# 贡献指南

感谢你为 Hermes Agent 做贡献。本页覆盖开发环境准备、代码库工作方式以及 PR 合入前的要求。

## 贡献优先级

项目通常按下面顺序看待贡献价值：

1. **Bug 修复**：崩溃、错误行为、数据丢失。
2. **跨平台兼容性**：macOS、不同 Linux 发行版、WSL2。
3. **安全加固**：shell 注入、prompt 注入、路径穿越。
4. **性能与稳健性**：重试、容错、优雅降级。
5. **新技能**：优先考虑通用技能。
6. **新工具**：通常较少需要，多数能力可以用 Skill 表达。
7. **文档**：修正、澄清、补充示例。

## 常见贡献入口

- 新工具：先读 [Adding Tools](./adding-tools_zh.md)
- 新技能：先读 [Creating Skills](./creating-skills_zh.md)
- 新 provider：先读 [Adding Providers](./adding-providers_zh.md)

## 开发环境

### 前置要求

| Requirement | Notes |
|---|---|
| **Git** | 需要支持 `--recurse-submodules` |
| **Python 3.11+** | 如未安装，`uv` 可自动拉取 |
| **uv** | Python 包管理器 |
| **Node.js 18+** | 可选；浏览器工具和 WhatsApp bridge 需要 |

### 克隆与安装

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent

uv venv venv --python 3.11
export VIRTUAL_ENV="$(pwd)/venv"

uv pip install -e ".[all,dev]"
uv pip install -e "./tinker-atropos"

# Optional: browser tools
npm install
```

### 开发配置

```bash
mkdir -p ~/.hermes/{cron,sessions,logs,memories,skills}
cp cli-config.yaml.example ~/.hermes/config.yaml
touch ~/.hermes/.env

echo 'OPENROUTER_API_KEY=sk-or-v1-your-key' >> ~/.hermes/.env
```

### 运行

```bash
mkdir -p ~/.local/bin
ln -sf "$(pwd)/venv/bin/hermes" ~/.local/bin/hermes

hermes doctor
hermes chat -q "Hello"
```

### 运行测试

```bash
pytest tests/ -v
```

## 代码风格

- 遵循 **PEP 8**，但不强制极端的行宽限制。
- 只在确有必要时写注释，重点解释意图、权衡或 API 怪癖。
- 优先捕获具体异常；对意外错误使用 `logger.warning()` / `logger.error()` 并带上 `exc_info=True`。
- 写代码时不要默认只有 Unix 场景。
- 不要硬编码 `~/.hermes`；代码路径使用 `get_hermes_home()`，面向用户的展示使用 `display_hermes_home()`。

## 跨平台兼容性

Hermes 正式支持 Linux、macOS 和 WSL2。原生 Windows 不在正式支持范围内，但代码仍应尽量避免硬崩。

### 1. `termios` 和 `fcntl` 仅适用于 Unix

涉及 TUI 或终端控制时，应同时捕获 `ImportError` 和 `NotImplementedError`，并提供降级路径。

### 2. 文件编码

某些环境下 `.env` 可能不是 UTF-8 编码。需要在读取失败时提供后备编码，例如 `latin-1`。

### 3. 进程管理

`os.setsid()`、`os.killpg()`、信号处理在不同平台行为不同。涉及进程启动和终止时，应先判断平台。

### 4. 路径分隔符

统一用 `pathlib.Path` 构建路径，不要用字符串拼接 `/`。

## 安全注意事项

Hermes 具备终端和文件访问能力，因此安全不是可选项。

### 现有保护

| Layer | Implementation |
|---|---|
| **Sudo password piping** | 使用 `shlex.quote()` 防止 shell 注入 |
| **Dangerous command detection** | `tools/approval.py` 中的模式匹配加审批流程 |
| **Cron prompt injection** | 拦截试图覆盖系统指令的作业提示 |
| **Write deny list** | 用 `os.path.realpath()` 规避符号链接绕过 |
| **Skills guard** | 对从 hub 安装的技能进行安全扫描 |
| **Code execution sandbox** | 子进程运行时剥离 API key |
| **Container hardening** | Docker 模式下丢弃 capabilities、限制 PID 等 |

### 贡献安全敏感代码时

- 把用户输入插入 shell 命令前，一律考虑 `shlex.quote()`
- 做访问控制前，先 `os.path.realpath()` 解析真实路径
- 不要在日志里写入密钥
- 工具执行外围应有稳妥的异常兜底
- 任何涉及路径或进程的变更，都尽量在多平台验证

## Pull Request 流程

### 分支命名

```text
fix/description
feat/description
docs/description
test/description
refactor/description
```

### 提交前检查

1. 运行测试：`pytest tests/ -v`
2. 手动验证：实际运行 `hermes` 走一遍你改过的路径
3. 检查跨平台影响：至少思考 macOS 与不同 Linux 发行版
4. 保持 PR 聚焦：一个 PR 只做一类逻辑变更

### PR 描述

建议说明：

- 改了什么；
- 为什么这么改；
- 如何测试；
- 在什么平台上验证过；
- 相关 issue。

### Commit Message

项目使用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
<type>(<scope>): <description>
```

常见 `type`：

- `fix`
- `feat`
- `docs`
- `test`
- `refactor`
- `chore`

常见 `scope`：

- `cli`
- `gateway`
- `tools`
- `skills`
- `agent`
- `install`
- `whatsapp`
- `security`

示例：

```text
fix(cli): prevent crash in save_config_value when model is a string
feat(gateway): add WhatsApp multi-user session isolation
fix(security): prevent shell injection in sudo password piping
```

## 报告问题

- 使用 GitHub Issues 提交；
- 附上操作系统、Python 版本、Hermes 版本与完整 traceback；
- 给出最小可复现步骤；
- 提交前先搜索是否已有重复问题；
- 安全漏洞请私下报告，不要公开发 issue。

## 社区

- **Discord**：`discord.gg/NousResearch`
- **GitHub Discussions**：设计提案和架构讨论
- **Skills Hub**：分享可复用技能

## 许可证

提交代码即表示你同意以 [MIT License](https://github.com/NousResearch/hermes-agent/blob/main/LICENSE) 授权你的贡献。
