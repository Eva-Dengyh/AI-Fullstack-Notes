---
title: 浏览器自动化
description: 用多个提供商控制浏览器，本地 Chrome via CDP，或云浏览器用于网页交互、表单填充、抓取等。
sidebar_label: Browser
---

# 浏览器自动化

Hermes Agent 包含完整的浏览器自动化工具集，具有多个后端选项：

- **Browserbase 云模式**，通过 [Browserbase](https://browserbase.com) 用于托管云浏览器和反机器人工具
- **Browser Use 云模式**，通过 [Browser Use](https://browser-use.com) 作为替代云浏览器提供商
- **Firecrawl 云模式**，通过 [Firecrawl](https://firecrawl.dev) 用于云浏览器和内置抓取
- **Camofox 本地模式**，通过 [Camofox](https://github.com/jo-inc/camofox-browser) 用于本地反检测浏览（基于 Firefox 的指纹欺骗）
- **本地 Chrome via CDP** — 使用 `/browser connect` 连接浏览器工具到自己的 Chrome 实例
- **本地浏览器模式**，通过 `agent-browser` CLI 和本地 Chromium 安装

在所有模式中，代理可以导航网站、与页面元素交互、填充表单和提取信息。

## 概述

页面表示为 **无障碍树**（基于文本的快照），非常适合 LLM 代理。交互式元素获得引用 ID（如 `@e1`、`@e2`），代理用于点击和输入。

关键功能：

- **多提供商云执行** — Browserbase、Browser Use 或 Firecrawl — 不需要本地浏览器
- **本地 Chrome 集成** — 通过 CDP 附加到运行的 Chrome 用于实际浏览
- **内置隐形** — 随机指纹、验证码求解、住宅代理（Browserbase）
- **会话隔离** — 每个任务获得自己的浏览器会话
- **自动清理** — 不活跃会话在超时后关闭
- **视觉分析** — 屏幕截图 + AI 分析用于视觉理解

## 设置

### Browserbase 云模式

使用 Browserbase 托管云浏览器，添加：

```bash
# 添加到 ~/.hermes/.env
BROWSERBASE_API_KEY=***
BROWSERBASE_PROJECT_ID=your-project-id-here
```

在 [browserbase.com](https://browserbase.com) 获取凭据。

### Browser Use 云模式

使用 Browser Use 作为云浏览器提供商，添加：

```bash
# 添加到 ~/.hermes/.env
BROWSER_USE_API_KEY=***
```

在 [browser-use.com](https://browser-use.com) 获取 API 密钥。Browser Use 通过其 REST API 提供云浏览器。如果同时设置了 Browserbase 和 Browser Use 凭据，Browserbase 优先。

### Firecrawl 云模式

使用 Firecrawl 作为云浏览器提供商，添加：

```bash
# 添加到 ~/.hermes/.env
FIRECRAWL_API_KEY=fc-***
```

在 [firecrawl.dev](https://firecrawl.dev) 获取 API 密钥。然后选择 Firecrawl 作为浏览器提供商：

```bash
hermes setup tools
# → Browser Automation → Firecrawl
```

可选设置：

```bash
# 自托管 Firecrawl 实例（默认：https://api.firecrawl.dev）
FIRECRAWL_API_URL=http://localhost:3002

# 会话 TTL 秒数（默认：300）
FIRECRAWL_BROWSER_TTL=600
```

### Camofox 本地模式

[Camofox](https://github.com/jo-inc/camofox-browser) 是自托管 Node.js 服务器，包装 Camoufox（带有 C++ 指纹欺骗的 Firefox fork）。它提供无云依赖的本地反检测浏览。

```bash
# 安装并运行
git clone https://github.com/jo-inc/camofox-browser && cd camofox-browser
npm install && npm start   # 首次运行下载 Camoufox (~300MB)

# 或通过 Docker
docker run -d --network host -e CAMOFOX_PORT=9377 jo-inc/camofox-browser
```

然后在 `~/.hermes/.env` 中设置：

```bash
CAMOFOX_URL=http://localhost:9377
```

或通过 `hermes tools` → Browser Automation → Camofox 配置。

当设置了 `CAMOFOX_URL` 时，所有浏览器工具自动路由通过 Camofox 而不是 Browserbase 或 agent-browser。

#### 持久浏览器会话

默认情况下，每个 Camofox 会话获得随机身份 — cookies 和登录在代理重启后不存活。要启用持久浏览器会话：

```yaml
# 在 ~/.hermes/config.yaml 中
browser:
  camofox:
    managed_persistence: true
```

启用时，Hermes 发送稳定的个人资料作用域身份到 Camofox。Camofox 服务器将此身份映射到持久浏览器个人资料目录，所以 cookies、登录和 localStorage 在重启间存活。不同的 Hermes 个人资料获得不同的浏览器个人资料（个人资料隔离）。

:::note
Camofox 服务器也必须在服务器端配置 `CAMOFOX_PROFILE_DIR` 以使持久性工作。
:::

#### VNC 实时视图

当 Camofox 在有头模式（可见浏览器窗口）运行时，它在健康检查响应中公开 VNC 端口。Hermes 自动发现这个并在导航响应中包含 VNC URL，所以代理可以分享链接让你实时观看浏览器。

### 本地 Chrome via CDP（`/browser connect`）

不使用云提供商，可以通过 Chrome DevTools Protocol (CDP) 将 Hermes 浏览器工具附加到自己的运行中的 Chrome 实例。这在想要实时看到代理在做什么、与需要自己的 cookies/会话的页面交互或避免云浏览器成本时很有用。

在 CLI 中，使用：

```
/browser connect              # 连接到 ws://localhost:9222 的 Chrome
/browser connect ws://host:port  # 连接到特定 CDP 端点
/browser status               # 检查当前连接
/browser disconnect            # 分离并返回到云/本地模式
```

如果 Chrome 还没有在运行远程调试，Hermes 将尝试自动使用 `--remote-debugging-port=9222` 启动。

:::tip
手动启动带有 CDP 启用的 Chrome：
```bash
# Linux
google-chrome --remote-debugging-port=9222

# macOS
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222
```
:::

通过 CDP 连接时，所有浏览器工具（`browser_navigate`、`browser_click` 等）在实时 Chrome 实例上运行，而不是启动云会话。

### 本地浏览器模式

如果 **不** 设置任何云凭据并不使用 `/browser connect`，Hermes 仍可以通过由 `agent-browser` 驱动的本地 Chromium 安装使用浏览器工具。

### 可选环境变量

```bash
# 住宅代理用于更好验证码求解（默认："true"）
BROWSERBASE_PROXIES=true

# 高级隐形用于自定义 Chromium — 需要 Scale Plan（默认："false"）
BROWSERBASE_ADVANCED_STEALTH=false

# 断开连接后会话重连 — 需要付费计划（默认："true"）
BROWSERBASE_KEEP_ALIVE=true

# 自定义会话超时毫秒数（默认：项目默认值）
# 示例：600000 (10分钟), 1800000 (30分钟)
BROWSERBASE_SESSION_TIMEOUT=600000

# 自动清理前的不活跃超时秒数（默认：120）
BROWSER_INACTIVITY_TIMEOUT=120
```

### 安装 agent-browser CLI

```bash
npm install -g agent-browser
# 或在仓库中本地安装：
npm install
```

:::info
`browser` 工具集必须包含在配置的 `toolsets` 列表中或通过 `hermes config set toolsets '["hermes-cli", "browser"]'` 启用。
:::

## 可用工具

### `browser_navigate`

导航到 URL。必须在任何其他浏览器工具之前调用。初始化 Browserbase 会话。

```
导航到 https://github.com/NousResearch
```

:::tip
对于简单信息检索，更倾向于 `web_search` 或 `web_extract` — 它们更快且更便宜。当需要 **交互** 页面（点击按钮、填充表单、处理动态内容）时使用浏览器工具。
:::

### `browser_snapshot`

获取当前页面无障碍树的基于文本的快照。返回具有引用 ID（如 `@e1`、`@e2`）的交互式元素用于 `browser_click` 和 `browser_type`。

- **`full=false`**（默认）：紧凑视图仅显示交互式元素
- **`full=true`**：完整页面内容

超过 8000 字符的快照自动被 LLM 总结。

### `browser_click`

点击由快照中的引用 ID 标识的元素。

```
点击 @e5 按下"登录"按钮
```

### `browser_type`

在输入字段中输入文本。先清空字段，然后输入新文本。

```
在搜索字段 @e3 中输入"hermes agent"
```

### `browser_scroll`

向上或向下滚动页面以显示更多内容。

```
向下滚动以查看更多结果
```

### `browser_press`

按下键盘按键。用于提交表单或导航。

```
按 Enter 提交表单
```

支持的按键：`Enter`、`Tab`、`Escape`、`ArrowDown`、`ArrowUp` 等。

### `browser_back`

返回浏览器历史中的上一页。

### `browser_get_images`

列出当前页面上的所有图像及其 URL 和替代文本。用于查找要分析的图像。

### `browser_vision`

拍摄屏幕截图并用视觉 AI 分析。当文本快照不捕获重要视觉信息时使用 — 特别对验证码、复杂布局或视觉验证挑战有用。

屏幕截图持久保存，文件路径随 AI 分析一起返回。在消息平台（Telegram、Discord、Slack、WhatsApp）上，可以请求代理共享屏幕截图 — 它将通过 `MEDIA:` 机制发送为本地照片附件。

```
此页面上的图表显示什么？
```

屏幕截图存储在 `~/.hermes/cache/screenshots/` 并在 24 小时后自动清理。

### `browser_console`

获取浏览器控制台输出（日志/警告/错误消息）和当前页面中的未捕获 JavaScript 异常。对于检测无障碍树中不出现的静默 JS 错误至关重要。

```
检查浏览器控制台中是否有任何 JavaScript 错误
```

使用 `clear=True` 在读取后清除控制台，所以后续调用仅显示新消息。

## 实用示例

### 填充网表

```
用户：在 example.com 上注册账户，使用我的邮箱 john@example.com

代理工作流：
1. browser_navigate("https://example.com/signup")
2. browser_snapshot()  → 看到带有引用的表单字段
3. browser_type(ref="@e3", text="john@example.com")
4. browser_type(ref="@e5", text="SecurePass123")
5. browser_click(ref="@e8")  → 点击"创建账户"
6. browser_snapshot()  → 确认成功
```

### 研究动态内容

```
用户：GitHub 上现在的热门仓库是什么？

代理工作流：
1. browser_navigate("https://github.com/trending")
2. browser_snapshot(full=true)  → 读取热门仓库列表
3. 返回格式化结果
```

## 会话录制

自动将浏览器会话记录为 WebM 视频文件：

```yaml
browser:
  record_sessions: true  # 默认：false
```

启用时，录制在第一个 `browser_navigate` 上自动启动，会话关闭时保存到 `~/.hermes/browser_recordings/`。在本地和云（Browserbase）模式中都有效。超过 72 小时的录制自动清理。

## 隐形功能

Browserbase 提供自动隐形功能：

| 功能 | 默认 | 说明 |
|------|------|------|
| 基本隐形 | 始终开启 | 随机指纹、视口随机化、验证码求解 |
| 住宅代理 | 开启 | 通过住宅 IP 路由以获得更好访问 |
| 高级隐形 | 关闭 | 自定义 Chromium 构建，需要 Scale Plan |
| 保持活跃 | 开启 | 网络小故障后会话重连 |

:::note
如果付费功能在计划中不可用，Hermes 自动回退 — 首先禁用 `keepAlive`，然后代理 — 所以在免费计划上浏览仍然有效。
:::

## 会话管理

- 每个任务通过 Browserbase 获得隔离浏览器会话
- 不活跃后会话自动清理（默认：2 分钟）
- 后台线程每 30 秒检查一次过时会话
- 紧急清理在进程退出时运行以防止孤立会话
- 会话通过 Browserbase API（`REQUEST_RELEASE` 状态）释放

## 限制

- **基于文本的交互** — 依赖无障碍树，不是像素坐标
- **快照大小** — 大页面可能在 8000 字符时被截断或 LLM 总结
- **会话超时** — 云会话基于提供商的计划设置过期
- **成本** — 云会话消费提供商额度；对话结束或不活跃后会话自动清理。使用 `/browser connect` 进行免费本地浏览。
- **无文件下载** — 无法从浏览器下载文件
