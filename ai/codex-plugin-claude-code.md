# Codex 插件接入 Claude Code，AI 编程开始进入双引擎时代

## 一、前言

今天 OpenAI 悄悄发布了一个新东西：[codex-plugin-cc](https://github.com/openai/codex-plugin-cc/tree/main)。简单来说，这个插件让你在 Claude Code 里，直接调用 OpenAI 的 Codex 来帮你审查代码、修 bug。

## 二、什么是 Codex？

Codex 是 OpenAI 推出的 AI 编程助手，专门用来写代码、审查代码、修复 bug。它和 Claude Code、Cursor 这些工具是同类产品，但背靠 OpenAI。之前 Codex 主要是独立运行的，现在它通过这个插件，可以嵌入到 Claude Code 里使用。

## 三、这个插件能做什么？

### 1. 代码审查

```
/codex:review
```

一行命令，Codex 就会帮你审查当前未提交的代码。审查是只读的，不会修改你的代码。

支持：

- 审查当前改动
- 审查某个分支 vs main 的差异
- 后台运行，不阻塞当前工作

### 2. 对抗性审查

```
/codex:adversarial-review challenge whether the caching design is right
```

普通的代码审查只是挑 bug，而对抗性审查会质疑你的设计决策：

- 这个设计真的合理吗？
- 有没有更好的方案？
- 这里的 tradeoff 是什么？

相当于请了一个"杠精"来审查你的代码，专门挑你设计上的问题。

### 3. 委托任务

```
/codex:rescue investigate why the tests are failing
/codex:rescue fix the failing test
```

直接让 Codex 去调查问题、尝试修复。

你可以指定模型：

- `-model spark` 用最新最强的模型
- `-model gpt-5.4-mini` 用更小更快的模型
- `-effort medium` 控制投入程度

### 4. 自动化审查门控

```
/codex:setup --enable-review-gate
```

开启这个功能后，每次你准备"发货"时，Claude Code 会自动触发 Codex 审查。如果审查发现问题，发货会被阻止。

这个功能适合团队使用，确保每一次代码提交都经过审查。

## 四、技术实现

这个插件的技术栈并不复杂：

- **调用方式**：通过本地 CLI `@openai/codex` 调用 Codex 服务
- **认证**：复用一个 Codex 账号，不需要额外登录
- **配置**：支持用户级配置 `~/.codex/config.toml` 和项目级配置

换句话说，如果你本地已经装了 Codex，这个插件直接就能用。

## 五、怎么安装？

**前置条件**：需要 Node.js 18.18+ 和一个 Codex 账号（ChatGPT 订阅或 API Key 都可以）。

用 Claude Code 添加市场：

```
/plugin marketplace add openai/codex-plugin-cc
```

安装插件：

```
/plugin install codex@openai-codex
```

重新加载插件：

```
/reload-plugins
```

检查 codex（如果 Codex 缺失且 npm 可用，它可以帮你安装 Codex）：

```
/codex:setup
```

## 六、总结

Codex Plugin for Claude Code 这个插件，本质上是把两个 AI 编程工具串联起来：

- **Claude Code**：日常编程、交互式对话
- **Codex**：专业的代码审查和修复

一个主打交互，一个主打审查，组合起来就是一个"编程 + 审查"的完整工作流。

如果你同时在用这两个工具，这个插件值得试试。
