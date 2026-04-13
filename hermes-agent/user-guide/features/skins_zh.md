---
sidebar_position: 10
title: "Skins & Themes（皮肤和主题）"
description: "使用内置和用户定义的 skins 自定义 Hermes CLI"
---

# Skins & Themes（皮肤和主题）

Skins 控制 **Hermes CLI 的视觉呈现**：横幅颜色、spinner 面孔和动词、响应框标签、品牌文本和工具活动前缀。

对话风格和视觉风格是分开的概念：

- **个性**改变 Agent 的语调和措辞。
- **Skin**改变 CLI 的外观。

## 改变 skins

```bash
/skin                # 显示当前 skin 和列出可用的 skins
/skin ares           # 切换到内置 skin
/skin mytheme        # 切换到来自 ~/.hermes/skins/mytheme.yaml 的自定义 skin
```

或在 `~/.hermes/config.yaml` 中设置默认 skin：

```yaml
display:
  skin: default
```

## 内置 skins

| Skin | 描述 | Agent 品牌 | 视觉字符 |
|------|-------------|----------------|------------------|
| `default` | 经典 Hermes — 金色和可爱 | `Hermes Agent` | 温暖的金色边界、玉米丝文本、spinners 中的可爱面孔。熟悉的 caduceus 横幅。干净和诱人。 |
| `ares` | 战神主题 — 深红和青铜 | `Ares Agent` | 深红色边界与青铜口音。激进的 spinner 动词（"铸造"、"行进"、"回火钢"）。自定义剑盾 ASCII 艺术横幅。 |
| `mono` | 单色 — 干净灰度 | `Hermes Agent` | 所有灰色 — 无颜色。边界是 `#555555`，文本是 `#c9d1d9`。理想用于最小终端设置或屏幕录制。 |
| `slate` | 凉爽蓝 — 开发者聚焦 | `Hermes Agent` | 皇家蓝边界 (`#4169e1`)、柔和蓝文本。平静和专业。无自定义 spinner — 使用默认面孔。 |
| `poseidon` | 海神主题 — 深蓝和海泡沫 | `Poseidon Agent` | 深蓝到海泡沫渐变。海洋主题的 spinners（"绘制水流"、"测量深度"）。三叉戟 ASCII 艺术横幅。 |
| `sisyphus` | Sisyphean 主题 — 禁欲灰度与坚持 | `Sisyphus Agent` | 浅灰与高对比。巨石主题的 spinners（"推上山"、"重置巨石"、"忍耐循环"）。巨石山 ASCII 艺术横幅。 |
| `charizard` | 火山主题 — 烧焦橙和余烬 | `Charizard Agent` | 温暖烧焦橙到余烬渐变。火主题的 spinners（"银行进气流"、"测量燃烧"）。龙轮廓 ASCII 艺术横幅。 |

## 可配置键的完整列表

### 颜色 (`colors:`)

控制整个 CLI 的所有颜色值。值是十六进制颜色字符串。

| 键 | 描述 | 默认（`default` skin） |
|-----|-------------|--------------------------|
| `banner_border` | 启动横幅周围的面板边界 | `#CD7F32`（青铜） |
| `banner_title` | 横幅中的标题文本颜色 | `#FFD700`（金色） |
| `banner_accent` | 横幅中的部分头部（可用工具等） | `#FFBF00`（琥珀色） |
| `banner_dim` | 横幅中的静音文本（分隔符、次要标签） | `#B8860B`（深金茶） |
| `banner_text` | 横幅中的正文（工具名称、技能名称） | `#FFF8DC`（玉米丝） |
| `ui_accent` | 一般 UI 口音颜色（突出显示、活动元素） | `#FFBF00` |
| `ui_label` | UI 标签和标签 | `#4dd0e1`（青绿） |
| `ui_ok` | 成功指示符（复选标记、完成） | `#4caf50`（绿色） |
| `ui_error` | 错误指示符（失败、阻止） | `#ef5350`（红色） |
| `ui_warn` | 警告指示符（谨慎、批准提示） | `#ffa726`（橙色） |
| `prompt` | 交互式提示文本颜色 | `#FFF8DC` |
| `input_rule` | 输入区域上方的水平规则 | `#CD7F32` |
| `response_border` | Agent 响应框周围的边界（ANSI 转义） | `#FFD700` |
| `session_label` | 会话标签颜色 | `#DAA520` |
| `session_border` | 会话 ID 暗边界颜色 | `#8B8682` |

### Spinner (`spinner:`)

控制等待 API 响应时显示的动画 spinner。

| 键 | 类型 | 描述 | 示例 |
|-----|------|-------------|---------|
| `waiting_faces` | 字符串列表 | 等待 API 响应时循环的面孔 | `["(⚔)", "(⛨)", "(▲)"]` |
| `thinking_faces` | 字符串列表 | 模型推理期间循环的面孔 | `["(⚔)", "(⌁)", "(<>)"]` |
| `thinking_verbs` | 字符串列表 | spinner 消息中显示的动词 | `["forging", "plotting", "hammering plans"]` |
| `wings` | [left, right] 对列表 | spinner 周围的装饰括号 | `[["⟪⚔", "⚔⟫"], ["⟪▲", "▲⟫"]]` |

当 spinner 值为空（如 `default` 和 `mono`），使用 `display.py` 中的硬编码默认值。

### 品牌 (`branding:`)

整个 CLI 界面中使用的文本字符串。

| 键 | 描述 | 默认 |
|-----|-------------|---------|
| `agent_name` | 在横幅标题和状态显示中显示的名称 | `Hermes Agent` |
| `welcome` | CLI 启动时显示的欢迎消息 | `欢迎来到 Hermes Agent！输入你的消息或 /help 了解命令。` |
| `goodbye` | 退出时显示的消息 | `再见！⚕` |
| `response_label` | 响应框头部上的标签 | ` ⚕ Hermes ` |
| `prompt_symbol` | 用户输入提示前的符号 | `❯ ` |
| `help_header` | `/help` 命令输出的头部文本 | `(^_^)? Available Commands` |

### 其他顶级键

| 键 | 类型 | 描述 | 默认 |
|-----|------|-------------|---------|
| `tool_prefix` | 字符串 | CLI 中工具输出行前置的字符 | `┊` |
| `tool_emojis` | dict | 每工具 emoji 覆盖用于 spinners 和进度（`{tool_name: emoji}`） | `{}` |
| `banner_logo` | 字符串 | Rich 标记 ASCII 艺术 logo（替换默认 HERMES_AGENT 横幅） | `""` |
| `banner_hero` | 字符串 | Rich 标记英雄艺术（替换默认 caduceus 艺术） | `""` |

## 自定义 skins

在 `~/.hermes/skins/` 下创建 YAML 文件。用户 skins 从内置 `default` skin 继承缺失值，所以你只需指定想要改变的键。

### 完整自定义 skin YAML 模板

```yaml
# ~/.hermes/skins/mytheme.yaml
# 完整 skin 模板 — 所有键显示。删除你不需要的；
# 缺失值自动从 'default' skin 继承。

name: mytheme
description: My custom theme

colors:
  banner_border: "#CD7F32"
  banner_title: "#FFD700"
  banner_accent: "#FFBF00"
  banner_dim: "#B8860B"
  banner_text: "#FFF8DC"
  ui_accent: "#FFBF00"
  ui_label: "#4dd0e1"
  ui_ok: "#4caf50"
  ui_error: "#ef5350"
  ui_warn: "#ffa726"
  prompt: "#FFF8DC"
  input_rule: "#CD7F32"
  response_border: "#FFD700"
  session_label: "#DAA520"
  session_border: "#8B8682"

spinner:
  waiting_faces:
    - "(⚔)"
    - "(⛨)"
    - "(▲)"
  thinking_faces:
    - "(⚔)"
    - "(⌁)"
    - "(<>)"
  thinking_verbs:
    - "processing"
    - "analyzing"
    - "computing"
    - "evaluating"
  wings:
    - ["⟪⚡", "⚡⟫"]
    - ["⟪●", "●⟫"]

branding:
  agent_name: "My Agent"
  welcome: "欢迎来到我的 Agent！输入你的消息或 /help 了解命令。"
  goodbye: "回见！⚡"
  response_label: " ⚡ My Agent "
  prompt_symbol: "⚡ ❯ "
  help_header: "(⚡) Available Commands"

tool_prefix: "┊"

# 每工具 emoji 覆盖（可选）
tool_emojis:
  terminal: "⚔"
  web_search: "🔮"
  read_file: "📄"

# 自定义 ASCII 艺术横幅（可选，Rich 标记支持）
# banner_logo: |
#   [bold #FFD700] MY AGENT [/]
# banner_hero: |
#   [#FFD700]  Custom art here  [/]
```

### 最小自定义 skin 示例

由于所有内容都从 `default` 继承，最小 skin 只需改变什么不同：

```yaml
name: cyberpunk
description: Neon terminal theme

colors:
  banner_border: "#FF00FF"
  banner_title: "#00FFFF"
  banner_accent: "#FF1493"

spinner:
  thinking_verbs: ["jacking in", "decrypting", "uploading"]
  wings:
    - ["⟨⚡", "⚡⟩"]

branding:
  agent_name: "Cyber Agent"
  response_label: " ⚡ Cyber "

tool_prefix: "▏"
```

## Hermes Mod — 视觉 Skin 编辑器

[Hermes Mod](https://github.com/cocktailpeanut/hermes-mod) 是社区构建的网页 UI 用于创建和管理 skins 视觉上。而不是手写 YAML，你得到一个点选编辑器带实时预览。

![Hermes Mod skin 编辑器](https://raw.githubusercontent.com/cocktailpeanut/hermes-mod/master/nous.png)

**它做什么：**

- 列出所有内置和自定义 skins
- 打开任何 skin 到视觉编辑器与所有 Hermes skin 字段（颜色、spinner、品牌、工具前缀、工具 emojis）
- 从文本提示生成 `banner_logo` 文本艺术
- 转换上传的图像（PNG、JPG、GIF、WEBP）到 `banner_hero` ASCII 艺术与多种渲染风格（盲文、ASCII 斜坡、块、点）
- 直接保存到 `~/.hermes/skins/`
- 通过更新 `~/.hermes/config.yaml` 激活 skin
- 显示生成的 YAML 和实时预览

### 安装

**选项 1 — Pinokio（一次点）：**

在 [pinokio.computer](https://pinokio.computer) 上找到它并用一次点击安装。

**选项 2 — npx（从终端最快）：**

```bash
npx -y hermes-mod
```

**选项 3 — 手动：**

```bash
git clone https://github.com/cocktailpeanut/hermes-mod.git
cd hermes-mod/app
npm install
npm start
```

### 使用

1. 启动应用（通过 Pinokio 或终端）。
2. 打开**Skin Studio**。
3. 选择一个内置或自定义 skin 来编辑。
4. 从文本生成一个 logo 和/或上传一个图像用于英雄艺术。选择一个渲染风格和宽度。
5. 编辑颜色、spinner、品牌和其他字段。
6. 点击**Save**以将 skin YAML 写到 `~/.hermes/skins/`。
7. 点击**Activate**以将其设置为当前 skin（更新 `config.yaml` 中的 `display.skin`）。

Hermes Mod 尊重 `HERMES_HOME` 环境变量，所以它与 [profiles](/docs/user-guide/profiles) 工作。

## 操作说明

- 内置 skins 从 `hermes_cli/skin_engine.py` 加载。
- 未知 skins 自动回退到 `default`。
- `/skin` 更新活跃 CLI 主题立即用于当前会话。
- `~/.hermes/skins/` 中的用户 skins 优先于具有相同名称的内置 skins。
- 通过 `/skin` 的 Skin 改变是仅会话。要使 skin 你的永久默认，在 `config.yaml` 中设置它。
- `banner_logo` 和 `banner_hero` 字段支持 Rich 控制台标记（例如 `[bold #FF0000]text[/]`）用于彩色 ASCII 艺术。
