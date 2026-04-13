---
title: "添加平台适配器"
description: "如何为 Hermes Gateway 新增消息平台适配器。"
---

# 添加平台适配器

平台适配器负责把外部消息平台的事件转换成 Hermes Gateway 的统一 `MessageEvent`，再把 Agent 响应投递回平台。

## 架构总览

每个平台适配器通常承担三件事：

- 接收平台事件并标准化；
- 通过 Gateway Runner 触发 Agent 会话；
- 把输出消息、附件或错误投递回平台。

适配器不应重新实现 Agent 逻辑。它只负责平台协议边界。

## 分步清单

### 1. Platform Enum

先在统一平台枚举中加入新平台名称。这个名称会用于配置、会话键、日志和状态跟踪。

### 2. Adapter File

新增平台适配器文件，通常放在 `gateway/platforms/` 下。它需要实现平台的启动、停止、消息接收和发送逻辑。

### 3. Gateway Config (`gateway/config.py`)

把平台所需配置项加入 gateway 配置，例如 token、webhook URL、polling 参数或平台特定开关。

### 4. Gateway Runner (`gateway/run.py`)

在 runner 中接入新适配器，确保启动 gateway 时能根据配置加载它。

### 5. 跨平台投递

如果平台支持从其它平台转发、mirror 或 cron 投递，需要接入通用 delivery 路径，而不是只支持本平台会话返回。

### 6. CLI 集成

如果用户需要通过 CLI 启动、配置或检查该平台，应更新对应命令和 setup 文案。

### 7. Tools

如果平台需要专属工具，例如发送附件、获取频道列表、上传文件，应在工具层新增能力，并做好权限与可用性检查。

### 8. Toolsets

把平台工具加入合适的 toolset，避免在不支持的平台上暴露无效工具。

### 9. 可选：Platform Hints

平台提示用于告诉模型当前平台的交互限制，例如消息长度、是否支持 markdown、是否支持附件。

### 10. 测试

至少验证：

- 适配器能启动和关闭；
- 消息能进入 gateway；
- 响应能正确投递；
- 会话 key 正确；
- 授权和 token lock 正常。

### 11. 文档

新增用户配置说明、平台限制、环境变量和故障排查内容。

## Parity Audit

新增平台时，建议用已有平台做对照审计：

```bash
# Find every .py file mentioning the reference platform
# Find every .py file mentioning the new platform
# Any file in the first set but not the second is a potential gap
```

这能帮助你发现 CLI、配置、工具、测试或文档中的遗漏。

## 常见模式

### Long-Poll Adapters

适合平台提供轮询 API 的场景。适配器需要处理：

- 轮询间隔；
- offset / cursor；
- 重试；
- 后台任务取消。

### Callback / Webhook Adapters

适合平台通过 HTTP 回调推送事件的场景。适配器需要处理：

- webhook 路由；
- 签名验证；
- 请求去重；
- 快速 ACK 与异步处理。

### Token Locks

如果一个平台 token 不允许多个 gateway 进程同时使用，就需要 token lock，防止 profile 或进程之间互相抢占。

## 参考实现

新增平台时，优先参考已经成熟的平台适配器，而不是从零设计。重点看：

- Telegram / Discord：典型 bot 消息流；
- Slack / Mattermost：团队消息平台；
- Email / SMS：非实时或弱会话平台；
- Webhook：通用 HTTP 入口。
