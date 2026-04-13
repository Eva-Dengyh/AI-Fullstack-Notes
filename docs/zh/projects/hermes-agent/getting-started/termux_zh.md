---
title: "Android / Termux"
description: "通过 Termux 在 Android 手机上直接运行 Hermes Agent"
---

# Hermes 在 Android 上的 Termux 运行

这是通过 [Termux](https://termux.dev/) 在 Android 手机上直接运行 Hermes Agent 的经过测试的路径。

它给你一个在手机上工作的本地 CLI，加上目前已知可在 Android 上干净安装的核心额外功能。

## 经过测试的路径中支持什么？

经过测试的 Termux 包安装：
- Hermes CLI
- cron 支持
- PTY/后台终端支持
- MCP 支持
- Honcho 内存支持
- ACP 支持

具体来说，它映射到：

```bash
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

## 经过测试的路径中还不支持什么？

一些功能仍然需要桌面/服务器风格的依赖，这些依赖不是为 Android 发布的，或者还没有在手机上验证：

- `.[all]` 目前在 Android 上不支持
- `voice` 扩展被 `faster-whisper -> ctranslate2` 阻止，`ctranslate2` 不为 Android 发布 wheels
- 自动浏览器 / Playwright 引导在 Termux 安装程序中被跳过
- 基于 Docker 的终端隔离在 Termux 内部不可用

这不会阻止 Hermes 作为手机原生 CLI agent 良好工作 — 这只是意味着推荐的移动安装比桌面/服务器安装故意更窄。

---

## 选项 1：单行安装程序

Hermes 现在提供了一个 Termux 感知的安装程序路径：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

在 Termux 上，安装程序自动：
- 使用 `pkg` 安装系统包
- 使用 `python -m venv` 创建 venv
- 使用 `pip` 安装 `.[termux]`
- 将 `hermes` 链接到 `$PREFIX/bin`，使其保留在你的 Termux PATH 上
- 跳过未测试的浏览器 / WhatsApp 引导

如果你想要显式命令或需要调试失败的安装，请使用下面的手动路径。

---

## 选项 2：手动安装（完全显式）

### 1. 更新 Termux 并安装系统包

```bash
pkg update
pkg install -y git python clang rust make pkg-config libffi openssl nodejs ripgrep ffmpeg
```

为什么这些包？
- `python` — 运行时 + venv 支持
- `git` — 克隆/更新仓库
- `clang`、`rust`、`make`、`pkg-config`、`libffi`、`openssl` — 在 Android 上构建一些 Python 依赖所需
- `nodejs` — 可选 Node 运行时用于经过测试的核心路径以外的实验
- `ripgrep` — 快速文件搜索
- `ffmpeg` — 媒体 / TTS 转换

### 2. 克隆 Hermes

```bash
git clone --recurse-submodules https://github.com/NousResearch/hermes-agent.git
cd hermes-agent
```

如果你已经克隆但没有子模块：

```bash
git submodule update --init --recursive
```

### 3. 创建虚拟环境

```bash
python -m venv venv
source venv/bin/activate
export ANDROID_API_LEVEL="$(getprop ro.build.version.sdk)"
python -m pip install --upgrade pip setuptools wheel
```

`ANDROID_API_LEVEL` 对于 Rust / maturin 基础的包（如 `jiter`）很重要。

### 4. 安装经过测试的 Termux 包

```bash
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

如果你只想要最小的核心 agent，这也有效：

```bash
python -m pip install -e '.' -c constraints-termux.txt
```

### 5. 将 `hermes` 放在你的 Termux PATH 上

```bash
ln -sf "$PWD/venv/bin/hermes" "$PREFIX/bin/hermes"
```

`$PREFIX/bin` 已在 Termux 的 PATH 中，所以这使 `hermes` 命令在新 shell 中持久，无需每次重新激活 venv。

### 6. 验证安装

```bash
hermes version
hermes doctor
```

### 7. 启动 Hermes

```bash
hermes
```

---

## 推荐的后续设置

### 配置一个模型

```bash
hermes model
```

或直接在 `~/.hermes/.env` 中设置密钥。

### 稍后重新运行完整的交互式设置向导

```bash
hermes setup
```

### 手动安装可选的 Node 依赖

经过测试的 Termux 路径故意跳过 Node/浏览器引导。如果你想稍后尝试：

```bash
npm install
```

将 Android 上的浏览器 / WhatsApp 工具视为实验性，直到另有说明。

---

## 故障排除

### 安装 `.[all]` 时"找不到解决方案"

改用经过测试的 Termux 包：

```bash
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

阻止程序目前是 `voice` 扩展：
- `voice` 拉取 `faster-whisper`
- `faster-whisper` 依赖 `ctranslate2`
- `ctranslate2` 不为 Android 发布 wheels

### `uv pip install` 在 Android 上失败

改用 Termux 路径，使用 stdlib venv + `pip`：

```bash
python -m venv venv
source venv/bin/activate
export ANDROID_API_LEVEL="$(getprop ro.build.version.sdk)"
python -m pip install --upgrade pip setuptools wheel
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

### `jiter` / `maturin` 抱怨 `ANDROID_API_LEVEL`

在安装前显式设置 API 级别：

```bash
export ANDROID_API_LEVEL="$(getprop ro.build.version.sdk)"
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

### `hermes doctor` 说 ripgrep 或 Node 丢失

使用 Termux 包安装它们：

```bash
pkg install ripgrep nodejs
```

### 安装 Python 包时构建失败

确保安装了构建工具链：

```bash
pkg install clang rust make pkg-config libffi openssl
```

然后重试：

```bash
python -m pip install -e '.[termux]' -c constraints-termux.txt
```

---

## 手机上的已知限制

- Docker 后端不可用
- 经过测试的路径中不提供通过 `faster-whisper` 的本地语音转录
- 浏览器自动化设置由安装程序故意跳过
- 一些可选额外功能可能有效，但目前仅 `.[termux]` 被记录为经过测试的 Android 包

如果你遇到新的 Android 特定问题，请打开一个 GitHub issue 并包括：
- 你的 Android 版本
- `termux-info`
- `python --version`
- `hermes doctor`
- 确切的安装命令和完整的错误输出
