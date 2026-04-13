---
title: "更新和卸载"
description: "如何更新 Hermes Agent 至最新版本或卸载它"
---

# 更新和卸载

## 更新

用一个命令更新至最新版本：

```bash
hermes update
```

这会拉取最新代码、更新依赖，并提示你配置自上次更新以来添加的任何新选项。

:::tip
`hermes update` 自动检测新配置选项并提示你添加它们。如果你跳过了该提示，你可以手动运行 `hermes config check` 以查看缺失的选项，然后运行 `hermes config migrate` 交互式添加它们。
:::

### 更新期间会发生什么

运行 `hermes update` 时，会发生以下步骤：

1. **Git pull** — 从 `main` 分支拉取最新代码并更新子模块
2. **Dependency install** — 运行 `uv pip install -e ".[all]"` 以获取新的或更改的依赖
3. **Config migration** — 检测自你的版本以来添加的新配置选项并提示你设置它们
4. **Gateway auto-restart** — 如果网关服务正在运行（Linux 上的 systemd、macOS 上的 launchd），在更新完成后**自动重启**，以便新代码立即生效

预期输出如下所示：

```
$ hermes update
Updating Hermes Agent...
📥 Pulling latest code...
Already up to date.  (或: Updating abc1234..def5678)
📦 Updating dependencies...
✅ Dependencies updated
🔍 Checking for new config options...
✅ Config is up to date  (或: Found 2 new options — running migration...)
🔄 Restarting gateway service...
✅ Gateway restarted
✅ Hermes Agent updated successfully!
```

### 推荐的更新后验证

`hermes update` 处理主更新路径，但快速验证确认一切落实无误：

1. `git status --short` — 如果树意外脏，检查后再继续
2. `hermes doctor` — 检查配置、依赖和服务健康
3. `hermes --version` — 确认版本按预期更新
4. 如果你使用网关：`hermes gateway status`
5. 如果 `doctor` 报告 npm 审计问题：在标记的目录中运行 `npm audit fix`

:::warning 更新后脏工作树
如果 `git status --short` 在 `hermes update` 后显示意外更改，停下来检查它们再继续。这通常意味着本地修改被重新应用到更新代码之上，或依赖步骤刷新了锁定文件。
:::

### 检查你的当前版本

```bash
hermes version
```

与 [GitHub 发版页面](https://github.com/NousResearch/hermes-agent/releases) 上的最新发版进行比较，或检查可用更新：

```bash
hermes update --check
```

### 从消息平台更新

你也可以通过从 Telegram、Discord、Slack 或 WhatsApp 发送来直接更新：

```
/update
```

这会拉取最新代码、更新依赖并重启网关。机器人在重启期间会短暂离线（通常 5–15 秒），然后恢复。

### 手动更新

如果你手动安装（不通过快速安装程序）：

```bash
cd /path/to/hermes-agent
export VIRTUAL_ENV="$(pwd)/venv"

# 拉取最新代码和子模块
git pull origin main
git submodule update --init --recursive

# 重新安装（拾取新依赖）
uv pip install -e ".[all]"
uv pip install -e "./tinker-atropos"

# 检查新配置选项
hermes config check
hermes config migrate   # 交互式添加任何缺失的选项
```

### 回滚说明

如果更新引入问题，你可以回滚到之前的版本：

```bash
cd /path/to/hermes-agent

# 列出最近的版本
git log --oneline -10

# 回滚到特定提交
git checkout <commit-hash>
git submodule update --init --recursive
uv pip install -e ".[all]"

# 如果正在运行，重启网关
hermes gateway restart
```

要回滚到特定发版标签：

```bash
git checkout v0.6.0
git submodule update --init --recursive
uv pip install -e ".[all]"
```

:::warning
如果添加了新选项，回滚可能会导致配置不兼容。回滚后运行 `hermes config check` 并从 `config.yaml` 中移除任何无法识别的选项，如果你遇到错误的话。
:::

### Nix 用户注意

如果你通过 Nix flake 安装，更新通过 Nix 包管理器管理：

```bash
# 更新 flake 输入
nix flake update hermes-agent

# 或用最新版本重建
nix profile upgrade hermes-agent
```

Nix 安装是不可变的 — 回滚由 Nix 的生成系统处理：

```bash
nix profile rollback
```

有关更多详情，请参见 [Nix Setup](./nix-setup.md)。

---

## 卸载

```bash
hermes uninstall
```

卸载程序给你选择保留配置文件（`~/.hermes/`）供将来重新安装。

### 手动卸载

```bash
rm -f ~/.local/bin/hermes
rm -rf /path/to/hermes-agent
rm -rf ~/.hermes            # 可选 — 如果计划重新安装，保留
```

:::info
如果你将网关安装为系统服务，先停止并禁用它：
```bash
hermes gateway stop
# Linux: systemctl --user disable hermes-gateway
# macOS: launchctl remove ai.hermes.gateway
```
:::
