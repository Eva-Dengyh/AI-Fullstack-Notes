---
title: "Profile 命令参考"
description: "Hermes profile 相关命令完整参考"
---

# Profile 命令参考

本页涵盖所有与 [Hermes profiles](../user-guide/profiles_zh.md) 相关的命令。如需查看通用 CLI 命令，请参见 [CLI 命令参考](./cli-commands_zh.md)。

## `hermes profile`

```bash
hermes profile <subcommand>
```

用于管理 profile 的顶层命令。执行 `hermes profile` 而不带子命令时，会显示帮助。

| 子命令 | 说明 |
|------------|-------------|
| `list` | 列出所有 profile。 |
| `use` | 设置当前激活（默认）profile。 |
| `create` | 创建新 profile。 |
| `delete` | 删除 profile。 |
| `show` | 显示 profile 详情。 |
| `alias` | 重新生成某个 profile 的 shell alias。 |
| `rename` | 重命名 profile。 |
| `export` | 将 profile 导出为 `tar.gz` 压缩包。 |
| `import` | 从 `tar.gz` 压缩包导入 profile。 |

## `hermes profile list`

```bash
hermes profile list
```

列出所有 profile。当前激活的 profile 会以 `*` 标记。

**示例：**

```bash
$ hermes profile list
  default
* work
  dev
  personal
```

无可选参数。

## `hermes profile use`

```bash
hermes profile use <name>
```

将 `<name>` 设为当前激活 profile。此后所有未显式指定 `-p` 的 `hermes` 命令都会使用该 profile。

| 参数 | 说明 |
|----------|-------------|
| `<name>` | 要激活的 profile 名称。使用 `default` 可切回基础 profile。 |

**示例：**

```bash
hermes profile use work
hermes profile use default
```

## `hermes profile create`

```bash
hermes profile create <name> [options]
```

创建一个新的 profile。

| 参数 / 选项 | 说明 |
|-------------------|-------------|
| `<name>` | 新 profile 的名称。必须是合法目录名（字母数字、连字符、下划线）。 |
| `--clone` | 从当前 profile 复制 `config.yaml`、`.env` 和 `SOUL.md`。 |
| `--clone-all` | 从当前 profile 复制全部内容（配置、记忆、技能、会话、状态）。 |
| `--clone-from <profile>` | 与 `--clone` 或 `--clone-all` 搭配使用，从指定 profile 克隆而不是从当前 profile 克隆。 |

**示例：**

```bash
# 空白 profile，需要完整重新配置
hermes profile create mybot

# 仅克隆当前 profile 的配置
hermes profile create work --clone

# 克隆当前 profile 的全部状态
hermes profile create backup --clone-all

# 从指定 profile 克隆配置
hermes profile create work2 --clone --clone-from work
```

## `hermes profile delete`

```bash
hermes profile delete <name> [options]
```

删除一个 profile，并移除其 shell alias。

| 参数 / 选项 | 说明 |
|-------------------|-------------|
| `<name>` | 要删除的 profile。 |
| `--yes`, `-y` | 跳过确认提示。 |

**示例：**

```bash
hermes profile delete mybot
hermes profile delete mybot --yes
```

:::warning
这会永久删除该 profile 的整个目录，包括所有配置、记忆、会话与技能。不能删除当前正在激活的 profile。
:::

## `hermes profile show`

```bash
hermes profile show <name>
```

显示某个 profile 的详情，包括 home 目录、配置模型、gateway 状态、技能数量和配置文件状态。

| 参数 | 说明 |
|----------|-------------|
| `<name>` | 要查看的 profile。 |

**示例：**

```bash
$ hermes profile show work
Profile: work
Path:    ~/.hermes/profiles/work
Model:   anthropic/claude-sonnet-4 (anthropic)
Gateway: stopped
Skills:  12
.env:    exists
SOUL.md: exists
Alias:   ~/.local/bin/work
```

## `hermes profile alias`

```bash
hermes profile alias <name> [options]
```

重新生成位于 `~/.local/bin/<name>` 的 shell alias 包装脚本。如果 alias 被误删，或你迁移 Hermes 安装位置后需要更新它，这个命令会很有用。

| 参数 / 选项 | 说明 |
|-------------------|-------------|
| `<name>` | 要创建 / 更新 alias 的 profile。 |
| `--remove` | 不创建脚本，而是删除 wrapper 脚本。 |
| `--name <alias>` | 自定义 alias 名称（默认使用 profile 名）。 |

**示例：**

```bash
hermes profile alias work
# 创建 / 更新 ~/.local/bin/work

hermes profile alias work --name mywork
# 创建 ~/.local/bin/mywork

hermes profile alias work --remove
# 删除 wrapper 脚本
```

## `hermes profile rename`

```bash
hermes profile rename <old-name> <new-name>
```

重命名一个 profile，同时更新其目录与 shell alias。

| 参数 | 说明 |
|----------|-------------|
| `<old-name>` | 当前 profile 名。 |
| `<new-name>` | 新的 profile 名。 |

**示例：**

```bash
hermes profile rename mybot assistant
# ~/.hermes/profiles/mybot → ~/.hermes/profiles/assistant
# ~/.local/bin/mybot → ~/.local/bin/assistant
```

## `hermes profile export`

```bash
hermes profile export <name> [options]
```

将一个 profile 导出为压缩的 `tar.gz` 包。

| 参数 / 选项 | 说明 |
|-------------------|-------------|
| `<name>` | 要导出的 profile。 |
| `-o`, `--output <path>` | 输出文件路径（默认：`<name>.tar.gz`）。 |

**示例：**

```bash
hermes profile export work
# 在当前目录创建 work.tar.gz

hermes profile export work -o ./work-2026-03-29.tar.gz
```

## `hermes profile import`

```bash
hermes profile import <archive> [options]
```

从 `tar.gz` 压缩包导入一个 profile。

| 参数 / 选项 | 说明 |
|-------------------|-------------|
| `<archive>` | 要导入的 `tar.gz` 压缩包路径。 |
| `--name <name>` | 导入后 profile 的名称（默认从压缩包推断）。 |

**示例：**

```bash
hermes profile import ./work-2026-03-29.tar.gz
# 从压缩包推断 profile 名称

hermes profile import ./work-2026-03-29.tar.gz --name work-restored
```

## `hermes -p` / `hermes --profile`

```bash
hermes -p <name> <command> [options]
hermes --profile <name> <command> [options]
```

全局参数，可在不改变默认 profile 的前提下，用指定 profile 运行任意 Hermes 命令。它只在本次命令执行期间覆盖当前激活 profile。

| 选项 | 说明 |
|--------|-------------|
| `-p <name>`, `--profile <name>` | 本次命令使用的 profile。 |

**示例：**

```bash
hermes -p work chat -q "Check the server status"
hermes --profile dev gateway start
hermes -p personal skills list
hermes -p work config edit
```

## `hermes completion`

```bash
hermes completion <shell>
```

生成 shell 自动补全脚本。包括 profile 名与 profile 子命令的补全。

| 参数 | 说明 |
|----------|-------------|
| `<shell>` | 要生成补全脚本的 shell：`bash` 或 `zsh`。 |

**示例：**

```bash
# 安装自动补全
hermes completion bash >> ~/.bashrc
hermes completion zsh >> ~/.zshrc

# 重新加载 shell
source ~/.bashrc
```

安装后，以下场景会支持 Tab 补全：
- `hermes profile <TAB>`：补全子命令（list、use、create 等）
- `hermes profile use <TAB>`：补全 profile 名称
- `hermes -p <TAB>`：补全 profile 名称

## See also

- [Profiles 用户指南](../user-guide/profiles_zh.md)
- [CLI 命令参考](./cli-commands_zh.md)
- [FAQ - Profiles 章节](./faq_zh.md#profiles)
