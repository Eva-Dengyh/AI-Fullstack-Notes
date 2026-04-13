---
title: "FAQ 与故障排查"
description: "Hermes Agent 常见问题与排错方案"
---

# FAQ 与故障排查

这里汇总了最常见问题与对应修复方案。

---

## 常见问题

### Hermes 支持哪些 LLM provider？

Hermes Agent 可与任何 OpenAI 兼容 API 配合使用。常见 provider 包括：

- **[OpenRouter](https://openrouter.ai/)**：一把 API Key 访问数百个模型，灵活性最高
- **Nous Portal**：Nous Research 自有推理端点
- **OpenAI**：GPT-4o、o1、o3 等
- **Anthropic**：Claude 系列（可通过 OpenRouter 或兼容代理）
- **Google**：Gemini 系列（可通过 OpenRouter 或兼容代理）
- **z.ai / ZhipuAI**：GLM 系列
- **Kimi / Moonshot AI**：Kimi 系列
- **MiniMax**：国际与中国端点
- **本地模型**：通过 [Ollama](https://ollama.com/)、[vLLM](https://docs.vllm.ai/)、[llama.cpp](https://github.com/ggerganov/llama.cpp)、[SGLang](https://github.com/sgl-project/sglang) 或任意 OpenAI 兼容服务器

可通过 `hermes model` 或编辑 `~/.hermes/.env` 设置 provider。全部键名请参见 [环境变量参考](./environment-variables_zh.md)。

### 支持 Windows 吗？

**不原生支持。** Hermes Agent 需要类 Unix 环境。在 Windows 上，请安装 [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)，并在 WSL 内运行 Hermes。标准安装命令在 WSL2 中可以正常工作：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 支持 Android / Termux 吗？

支持。Hermes 现在有经过测试的 Android Termux 安装路径。

快速安装：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

完整手动步骤、支持的附加功能与当前限制，请参见 [Termux 指南](../getting-started/termux.md)。

需要注意的是：`.[all]` 额外依赖当前在 Android 上不可用，因为 `voice` 依赖 `faster-whisper`，而它又依赖 `ctranslate2`；`ctranslate2` 没有发布 Android wheel。请改用经过验证的 `.[termux]`。

### 数据会被发送到哪里？

API 调用 **只会发送到你配置的 LLM provider**（例如 OpenRouter 或本地 Ollama 实例）。Hermes Agent 不收集遥测、使用数据或分析数据。你的对话、记忆和技能都保存在本地 `~/.hermes/`。

### 可以离线使用或连接本地模型吗？

可以。运行 `hermes model`，选择 **Custom endpoint**，然后填入你的服务器地址：

```bash
hermes model
# Select: Custom endpoint (enter URL manually)
# API base URL: http://localhost:11434/v1
# API key: ollama
# Model name: qwen3.5:27b
# Context length: 32768
```

也可以直接在 `config.yaml` 中配置：

```yaml
model:
  default: qwen3.5:27b
  provider: custom
  base_url: http://localhost:11434/v1
```

Hermes 会把 endpoint、provider 和 `base_url` 持久化到 `config.yaml`，重启后仍然有效。若你的本地服务只加载了一个模型，`/model custom` 可自动识别。

:::tip Ollama 用户
如果你在 Ollama 中设置了自定义 `num_ctx`，记得在 Hermes 中配置匹配的上下文长度。Ollama 的 `/api/show` 返回的是模型最大上下文，而不是你实际设置的 `num_ctx`。
:::

### 成本如何？

Hermes Agent 本身 **免费且开源**（MIT 许可）。你只为所选 LLM provider 的 API 用量付费。本地模型则完全免费。

### 多个人可以共用一个实例吗？

可以。[消息 gateway](../user-guide/messaging/index.md) 允许多个用户通过 Telegram、Discord、Slack、WhatsApp 或 Home Assistant 与同一个 Hermes 实例交互。访问控制通过 allowlist 或 DM pairing 完成。

### Memory 和 Skills 的区别是什么？

- **Memory** 存的是 **事实**：关于你、项目和偏好的信息
- **Skills** 存的是 **过程**：某类任务应该怎样一步步完成

二者都可以跨会话持久化。详见 [Memory](../user-guide/features/memory.md) 与 [Skills](../user-guide/features/skills.md)。

---

## 故障排查

### 安装问题

#### 安装后提示 `hermes: command not found`

**原因：**shell 尚未重新加载更新后的 PATH。

**解决：**

```bash
source ~/.bashrc
source ~/.zshrc
```

如果还不行，可检查安装位置：

```bash
which hermes
ls ~/.local/bin/hermes
```

#### Python 版本过低

**原因：**Hermes 需要 Python 3.11 或更高版本。

**解决：**

```bash
python3 --version
sudo apt install python3.12
brew install python@3.12
```

#### `uv: command not found`

**原因：**`uv` 包管理器未安装，或不在 PATH 中。

**解决：**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source ~/.bashrc
```

#### 安装时出现 permission denied

**原因：**没有权限写入安装目录。

**解决：**

```bash
# 不要用 sudo 跑安装器，它默认安装到 ~/.local/bin
sudo rm /usr/local/bin/hermes
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Provider 与模型问题

#### API Key 不生效

**原因：**Key 缺失、过期、设置错误，或与 provider 不匹配。

**解决：**

```bash
hermes config show
hermes model
hermes config set OPENROUTER_API_KEY sk-or-v1-xxxxxxxxxxxx
```

#### 模型不可用 / model not found

**原因：**模型标识写错，或当前 provider 不提供该模型。

**解决：**

```bash
hermes model
hermes config set HERMES_MODEL openrouter/nous/hermes-3-llama-3.1-70b
hermes chat --model openrouter/meta-llama/llama-3.1-70b-instruct
```

#### 429 限流错误

**原因：**超出 provider 限流额度。

**解决：**
- 稍等后重试
- 升级 provider 套餐
- 切换其他模型或 provider
- 使用 `hermes chat --provider <alternative>`

#### 上下文长度超限

**原因：**对话过长，超过模型上下文窗口；或 Hermes 识别错了模型上下文长度。

**解决：**

```bash
/compress
hermes chat
hermes chat --model openrouter/google/gemini-3-flash-preview
```

如果在第一次长对话中就遇到，可能是上下文长度识别错误。可在 `~/.hermes/config.yaml` 中手动指定：

```yaml
model:
  default: your-model-name
  context_length: 131072
```

### 终端问题

#### 命令被判定为危险

**原因：**Hermes 检测到潜在破坏性命令（例如 `rm -rf`、`DROP TABLE`）。这是安全功能。

**解决：**
- 审核后输入 `y` 批准
- 让 agent 选择更安全的替代方案
- 查阅 [Security 文档](../user-guide/security.md)

#### 通过消息 gateway 使用 `sudo` 失败

**原因：**消息 gateway 没有交互式终端，`sudo` 无法弹出密码提示。

**解决：**
- 消息模式下尽量避免 `sudo`
- 必须使用时，可在 `/etc/sudoers` 中为特定命令配置免密 sudo
- 或直接切换到终端界面：`hermes chat`

#### Docker backend 无法连接

**原因：**Docker daemon 未运行，或当前用户无权限。

**解决：**

```bash
docker info
sudo usermod -aG docker $USER
newgrp docker
docker run hello-world
```

### 消息平台问题

#### 机器人不回复消息

**原因：**gateway 未运行、未授权，或你的用户不在 allowlist 中。

**解决：**

```bash
hermes gateway status
hermes gateway start
tail -50 ~/.hermes/logs/gateway.log
```

#### 消息无法送达

**原因：**网络问题、bot token 过期、或 webhook 配置错误。

**解决：**
- 用 `hermes gateway setup` 检查 token
- 查看 gateway 日志
- 对 Slack / WhatsApp 之类依赖 webhook 的平台，确保服务器可公网访问

#### Gateway 无法启动

**原因：**依赖缺失、端口冲突或 token 配置错误。

**解决：**

```bash
pip install "hermes-agent[telegram]"
lsof -i :8080
hermes config show
```

#### WSL 下 gateway 频繁断开或 `hermes gateway start` 失败

**原因：**WSL 的 systemd 支持不稳定。

**解决：**

```bash
hermes gateway run
tmux new -s hermes 'hermes gateway run'
nohup hermes gateway run > ~/.hermes/logs/gateway.log 2>&1 &
```

#### macOS 下 gateway 找不到 Node.js / ffmpeg 等工具

**原因：**launchd 服务继承的 PATH 很精简，不包含 Homebrew、nvm、cargo 等用户路径。

**解决：**

```bash
hermes gateway install
hermes gateway start
```

### 性能问题

#### 响应慢

**原因：**模型大、API 服务器距离远，或系统提示 / 工具过多。

**解决：**
- 切更快的模型
- 减少启用的工具集
- 检查与 provider 的网络延迟
- 本地模型确保有足够 GPU 显存

#### Token 使用过高

**原因：**长对话、冗长系统提示或大量工具输出。

**解决：**

```bash
/compress
/usage
```

### MCP 问题

#### MCP server 连接不上

**原因：**server 二进制找不到、命令路径错误，或运行时缺失。

**解决：**

```bash
cd ~/.hermes/hermes-agent && uv pip install -e ".[mcp]"
node --version
npx --version
npx -y @modelcontextprotocol/server-filesystem /tmp
```

#### MCP server 的工具没有出现

**原因：**工具发现失败、被配置过滤掉，或该 server 不支持你期待的 MCP 能力。

**解决：**
- 检查 gateway / agent 日志
- 确认 server 能响应 `tools/list`
- 检查 `tools.include`、`tools.exclude`、`tools.resources`、`tools.prompts` 与 `enabled`
- 配置修改后执行 `/reload-mcp`

### Profiles

#### Profiles 和手动设置 `HERMES_HOME` 有什么区别？

Profile 是构建在 `HERMES_HOME` 之上的托管层。你当然可以在每次执行前手动导出 `HERMES_HOME=/some/path`，但 profile 会替你处理目录结构、shell alias、激活 profile 跟踪，以及多 profile 间的技能同步。

#### 两个 profile 可以共用同一个 bot token 吗？

不能。每个平台的 bot token 都要求独占。如果两个 profile 同时使用同一 token，后启动的 gateway 会连接失败。

#### Profiles 会共享 memory 或 sessions 吗？

不会。每个 profile 都有自己的记忆、会话数据库和技能目录，彼此完全隔离。

#### 执行 `hermes update` 时会发生什么？

`hermes update` 只会拉一次最新代码并重装依赖，而不是按 profile 分别更新。之后它会把更新后的技能同步到所有 profile。

### 工作流与模式

#### 不同任务使用不同模型（多模型工作流）

可以通过 delegation 配置，让子 agent 自动使用不同模型。写入 `~/.hermes/config.yaml`：

```yaml
delegation:
  model: "google/gemini-3-flash-preview"
  provider: "openrouter"
```

这样主对话可以仍然使用 GPT-5.4，而被 `delegate_task` 派发出去的子 agent 则自动切换到 Gemini。

#### Telegram 里不想看到日志和推理过程

在 `config.yaml` 中调整：

```yaml
display:
  tool_progress: "off"
```

- `off`：只显示最终回复
- `new`：显示新工具调用的一行提示
- `all`：显示全部工具活动及结果
- `verbose`：显示完整工具参数与输出

#### Telegram 的 slash command 数量超限，怎么管理 skills？

使用 `hermes skills config` 按平台禁用技能。它会写入：

```yaml
skills:
  disabled: []
  platform_disabled:
    telegram: [skill-a, skill-b]
```

修改后需要重启 gateway。

### 把 Hermes 迁移到另一台机器

可以直接复制 `~/.hermes/`（排除 `hermes-agent` 代码目录），或使用 profile export / import：

```bash
hermes profile export default ./hermes-backup.tar.gz
hermes profile import ./hermes-backup.tar.gz default
```

---

## 仍然没解决？

如果这里没有覆盖你的问题：

1. 搜索已有 issue：[GitHub Issues](https://github.com/NousResearch/hermes-agent/issues)
2. 向社区提问：[Nous Research Discord](https://discord.gg/nousresearch)
3. 提交 bug 报告时，请附上操作系统、Python 版本（`python3 --version`）、Hermes 版本（`hermes --version`）以及完整错误信息
