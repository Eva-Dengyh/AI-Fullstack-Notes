# Claude Code CLI 快速教程：从环境搭建到批量处理的实用指令集

## Claude Code 配置教程（以 Mac 系统为例）

### 1. 必备工具

| 工具 | 用途 | 安装地址 |
|------|------|----------|
| Node.js | 运行环境 | https://nodejs.org |
| Git | 版本控制 | https://git-scm.com |

### 2. 检查 Node.js 版本

```bash
node -v
```

### 3. 检查 Git 版本

```bash
git --version
```

### 4. 安装 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

### 5. 验证 Claude Code 安装

```bash
claude --version
```

### 6. 配置环境变量

```bash
cursor ~/.zshrc
# 或
vim ~/.zshrc
```

写入以下内容：

```bash
export ANTHROPIC_BASE_URL="https://******"
export ANTHROPIC_AUTH_TOKEN="******"
```

### 7. 重载配置文件

```bash
source ~/.zshrc
```

### 8. 启动 Claude

```bash
claude
```

---

## 常用指令

| 指令 | 说明 |
|------|------|
| `/help` | 显示全部可用命令 |
| `/exit` | 退出当前对话 |
| `/clear` | 清除当前对话历史 |
| `/rename <名称>` | 重命名会话 |
| `/resume [session]` | 恢复已命名会话 |
| `/model` | 切换模型 |
| `/review` | AI 代码审查 |
| `/rewind` | 回退改动（代码 / 对话） |
| `/cost` | 查看 Token 用量和消耗 |

更多指令见官网：https://code.claude.com/docs/en/overview
