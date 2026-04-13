---
sidebar_position: 9
title: "个性化 & SOUL.md"
description: "使用全局 SOUL.md、内置个性和自定义人物定义自定义 Hermes Agent 个性"
---

# 个性化 & SOUL.md

Hermes Agent 的个性完全可自定义。`SOUL.md` 是**主要身份** — 它是系统提示中的第一项并定义 Agent 是谁。

- `SOUL.md` — 一个耐久人物文件住在 `HERMES_HOME` 并作为 Agent 身份（系统提示中的第 #1 插槽）
- 内置或自定义 `/personality` 预设 — 会话级系统提示叠加

如果你想改变 Hermes 是谁 — 或用完全不同的 Agent 人物替换它 — 编辑 `SOUL.md`。

## SOUL.md 现在工作原理

Hermes 现在在以下位置自动播种默认 `SOUL.md`：

```text
~/.hermes/SOUL.md
```

更准确地说，它使用当前实例的 `HERMES_HOME`，所以如果你用自定义主目录运行 Hermes，它将使用：

```text
$HERMES_HOME/SOUL.md
```

### 重要行为

- **SOUL.md 是 Agent 的主要身份。** 它占系统提示中的第 #1 插槽，替换硬编码的默认身份。
- Hermes 如果不存在则自动创建启动 `SOUL.md`
- 现有用户 `SOUL.md` 文件绝不被覆盖
- Hermes 仅从 `HERMES_HOME` 加载 `SOUL.md`
- Hermes 不在当前工作目录中查找 `SOUL.md`
- 如果 `SOUL.md` 存在但为空，或无法加载，Hermes 回退到内置默认身份
- 如果 `SOUL.md` 有内容，那个内容在安全扫描和截断后逐字注入
- SOUL.md 不在上下文文件部分中重复 — 它仅作为身份出现一次

这使 `SOUL.md` 一个真实的每个用户或每个实例身份，而不仅仅是一个加法层。

## 为什么这个设计

这保持个性可预测。

如果 Hermes 从你恰好启动它的任何目录加载 `SOUL.md`，你的个性可能在 projects 之间意外改变。通过仅从 `HERMES_HOME` 加载，个性属于 Hermes 实例本身。

这也使教用户更容易：
- "编辑 `~/.hermes/SOUL.md` 以改变 Hermes 默认个性。"

## 在哪里编辑它

对于大多数用户：

```bash
~/.hermes/SOUL.md
```

如果你使用自定义主目录：

```bash
$HERMES_HOME/SOUL.md
```

## 什么应该进入 SOUL.md？

使用它用于耐久的声音和个性指导，如：
- 语气
- 通信风格
- 直接程度水平
- 默认交互风格
- 要避免的风格方面
- Hermes 应该如何处理不确定性、分歧或歧义

少用它用于：
- 一次性 project 指导
- 文件路径
- repo 约定
- 临时工作流细节

那些属于 `AGENTS.md`，不是 `SOUL.md`。

## 好的 SOUL.md 内容

好的 SOUL 文件是：
- 跨上下文稳定
- 足够宽泛以应用在许多对话中
- 足够具体以实质上塑造声音
- 专注于通信和身份，而不是任务特定指导

### 示例

```markdown
# 个性

你是一个务实的资深工程师，有强大的品味。
你为真理、清晰和有用性优化，胜过礼貌的表演。

## 风格
- 直接但不冷酷
- 偏好物质胜过填充
- 当某事是坏主意时推回
- 坦率地承认不确定性
- 保持解释紧凑除非深度有用

## 要避免
- 拍马屁
- 炒作语言
- 如果错误则重复用户的框架
- 过度解释明显的事情

## 技术立场
- 偏好简单系统胜过聪明系统
- 关心操作现实，而不是理想化架构
- 作为设计的一部分治疗边界情况，不是清理
```

## Hermes 注入到提示什么

`SOUL.md` 内容直接进入系统提示的第 #1 插槽 — Agent 身份位置。没有包装语言加到它周围。

内容通过：
- 提示注入扫描
- 如果太大则截断

如果文件为空、仅空白或无法读取，Hermes 回退到内置默认身份（"你是 Hermes Agent，由 Nous Research 创建的智能 AI 助手..."）。此回退也适用于 `skip_context_files` 设置时（例如在子 Agent/委托上下文中）。

## 安全扫描

`SOUL.md` 像其他上下文承载文件一样在包含前扫描提示注入模式。

这意味着你应该仍然保持它聚焦于人物/声音而不是试图偷偷进奇怪的元指导。

## SOUL.md vs AGENTS.md

这是最重要的区别。

### SOUL.md
用于：
- 身份
- 语调
- 风格
- 通信默认
- 个性级行为

### AGENTS.md
用于：
- project 架构
- 编码约定
- 工具偏好
- repo 特定工作流
- 命令、端口、路径、部署说明

一个有用的规则：
- 如果它应该跟随你到处，它属于 `SOUL.md`
- 如果它属于 project，它属于 `AGENTS.md`

## SOUL.md vs `/personality`

`SOUL.md` 是你的耐久默认个性。

`/personality` 是改变或补充当前系统提示的会话级叠加。

所以：
- `SOUL.md` = 基线声音
- `/personality` = 临时模式切换

示例：
- 保持务实的默认 SOUL，然后为辅导对话使用 `/personality teacher`
- 保持简洁的 SOUL，然后为头脑风暴使用 `/personality creative`

## 内置个性

Hermes 附带内置个性你可以用 `/personality` 切换到。

| 名称 | 描述 |
|------|-------------|
| **helpful** | 友好的通用助手 |
| **concise** | 简短、要点响应 |
| **technical** | 详细、准确的技术专家 |
| **creative** | 创新、开箱即出思维 |
| **teacher** | 耐心的教育者带清晰示例 |
| **kawaii** | 可爱表达、闪闪发光和热情 ★ |
| **catgirl** | Neko chan 与类似猫的表达、nya~ |
| **pirate** | 船长 Hermes、科技精通的掠夺者 |
| **shakespeare** | 吟游诗人的散文与戏剧天赋 |
| **surfer** | 完全放松的兄弟振动 |
| **noir** | 硬汉侦探叙述 |
| **uwu** | 最大可爱与 uwu 说话 |
| **philosopher** | 对每个查询的深刻沉思 |
| **hype** | 最大能量和热情!!! |

## 用命令切换个性

### CLI

```text
/personality
/personality concise
/personality technical
```

### 消息传递平台

```text
/personality teacher
```

这些是方便的叠加，但你的全局 `SOUL.md` 仍然给 Hermes 其持久默认个性除非叠加有意义地改变它。

## 配置中的自定义个性

你也可以在 `~/.hermes/config.yaml` 下 `agent.personalities` 中定义命名的自定义个性。

```yaml
agent:
  personalities:
    codereviewer: >
      你是一个细致的代码审查者。识别 bugs、安全问题、
      性能关切和不清晰的设计选择。精确而建设性。
```

然后用以下切换到它：

```text
/personality codereviewer
```

## 推荐工作流

一个强大的默认设置是：

1. 在 `~/.hermes/SOUL.md` 中保持深思熟虑的全局 `SOUL.md`
2. 在 `AGENTS.md` 中放置 project 指导
3. 仅当你想要临时模式转移时使用 `/personality`

这给你：
- 稳定的声音
- project 特定行为在应该的位置
- 需要时的临时控制

## 个性如何与完整提示交互

在高水平，提示栈包括：
1. **SOUL.md**（Agent 身份 — 或内置回退如 SOUL.md 不可用）
2. 工具感知行为指导
3. 内存/用户上下文
4. 技能指导
5. 上下文文件（`AGENTS.md`、`.cursorrules`）
6. 时间戳
7. 平台特定格式提示
8. 可选系统提示叠加如 `/personality`

`SOUL.md` 是基础 — 一切都构建在其之上。

## 相关文档

- [Context Files](/docs/user-guide/features/context-files)
- [Configuration](/docs/user-guide/configuration)
- [Tips & Best Practices](/docs/guides/tips)
- [SOUL.md Guide](/docs/guides/use-soul-with-hermes)

## CLI 出现 vs 对话个性

对话个性和 CLI 出现是分开的：

- `SOUL.md`、`agent.system_prompt` 和 `/personality` 影响 Hermes 说话方式
- `display.skin` 和 `/skin` 影响 Hermes 在终端中看起来如何

对于终端外观，见 [Skins & Themes](./skins.md)。
