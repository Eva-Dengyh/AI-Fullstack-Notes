---
title: 视觉和图像粘贴
description: 将图像从剪贴板粘贴到 Hermes CLI 中，进行多模态视觉分析。
sidebar_label: 视觉和图像粘贴
---

# 视觉和图像粘贴

Hermes Agent 支持**多模态视觉** — 你可直接将图像从剪贴板粘贴到 CLI 中，要求 Agent 分析、描述或处理它们。图像作为 base64 编码的内容块发送到模型，所以任何视觉能力的模型都可处理它们。

## 工作原理

1. 将图像复制到你的剪贴板（截图、浏览器图像等）
2. 用下面的一种方法附加它
3. 输入你的问题并按 Enter
4. 图像显示为上方输入的 `[📎 Image #1]` 徽章
5. 提交时，图像作为视觉内容块发送给模型

在发送前你可附加多个图像 — 每个获得自己的徽章。按 `Ctrl+C` 清除所有附加的图像。

图像保存到 `~/.hermes/images/` 作为带时间戳文件名的 PNG 文件。

## 粘贴方法

如何附加图像取决于你的终端环境。并非所有方法都在各处工作 — 这是完整分解：

### `/paste` 命令

**最可靠的方法。到处工作。**

```
/paste
```

输入 `/paste` 并按 Enter。Hermes 检查你的剪贴板是否有图像并附加它。这在每个环境中工作，因为它显式调用剪贴板后端 — 无需担心终端按键绑定拦截。

### Ctrl+V / Cmd+V（括号粘贴）

当你粘贴与图像一起在剪贴板上的文本时，Hermes 自动也检查图像。这在以下情况工作：
- 你的剪贴板包含**文本和图像**（一些应用在复制时将两者放在剪贴板）
- 你的终端支持括号粘贴（大多数现代终端都支持）

:::warning
如果你的剪贴板**仅有图像**（无文本），Ctrl+V 在大多数终端中不做任何事。终端仅能粘贴文本 — 没有标准机制粘贴二进制图像数据。改用 `/paste` 或 Alt+V。
:::

### Alt+V

Alt 键组合通过大多数终端模拟器（它们作为 ESC + 键发送而非被拦截）。按 `Alt+V` 检查剪贴板是否有图像。

:::caution
**在 VSCode 的集成终端中不工作。** VSCode 拦截许多 Alt+key 组合用于自己的 UI。改用 `/paste`。
:::

### Ctrl+V（原始 — 仅 Linux）

在 Linux 桌面终端（GNOME Terminal、Konsole、Alacritty 等）上，`Ctrl+V` **不是**粘贴快捷键 — `Ctrl+Shift+V` 是。所以 `Ctrl+V` 发送一个原始字节到应用，Hermes 捕捉它检查剪贴板。这仅在带 X11 或 Wayland 剪贴板访问的 Linux 桌面终端上工作。

## 平台兼容性

| 环境 | `/paste` | Ctrl+V 文本+图像 | Alt+V | 笔记 |
|---|:---:|:---:|:---:|---|
| **macOS Terminal / iTerm2** | ✅ | ✅ | ✅ | 最好体验 — `osascript` 总是可用 |
| **Linux X11 桌面** | ✅ | ✅ | ✅ | 需要 `xclip`（`apt install xclip`） |
| **Linux Wayland 桌面** | ✅ | ✅ | ✅ | 需要 `wl-paste`（`apt install wl-clipboard`） |
| **WSL2（Windows Terminal）** | ✅ | ✅¹ | ✅ | 使用 `powershell.exe` — 无需额外安装 |
| **VSCode 终端（本地）** | ✅ | ✅¹ | ❌ | VSCode 拦截 Alt+key |
| **VSCode 终端（SSH）** | ❌² | ❌² | ❌ | 远程剪贴板不可访问 |
| **SSH 终端（任何）** | ❌² | ❌² | ❌² | 见下面 [SSH & Remote Sessions](#ssh--remote-sessions) |

¹ 仅当剪贴板有文本和图像（仅图像剪贴板 = 无任何事）
² 见 [SSH & Remote Sessions](#ssh--remote-sessions)

## 平台特定设置

### macOS

**无需设置。** Hermes 使用 `osascript`（macOS 内置）来读剪贴板。对于更快的性能，可选安装 `pngpaste`：

```bash
brew install pngpaste
```

### Linux（X11）

安装 `xclip`：

```bash
# Ubuntu/Debian
sudo apt install xclip

# Fedora
sudo dnf install xclip

# Arch
sudo pacman -S xclip
```

### Linux（Wayland）

安装 `wl-clipboard`：

```bash
# Ubuntu/Debian
sudo apt install wl-clipboard

# Fedora
sudo dnf install wl-clipboard
```

## SSH 和远程会话

在远程（SSH）会话中无法访问剪贴板，因为麦克风和剪贴板是本地硬件资源。SSH 隧道可转发 X11，但剪贴板访问不标准工作。

**解决方案：** 用 scp 或你的编辑器上传图像文件到远程服务器，然后在本地处理它们或使用 `/paste` 尽管它无法工作（它会失败但足够礼貌地）。
