---
sidebar_label: "上下文引用"
title: "上下文引用"
description: "内联 @-语法用于直接附加文件、文件夹、git 差异和 URL 到你的消息中"
---

# 上下文引用

输入 `@` 跟随引用以直接注入内容到你的消息。Hermes 扩展内联引用并附加内容在一个 `--- Attached Context ---` 部分下。

## 支持的引用

| 语法 | 描述 |
|--------|-------------|
| `@file:path/to/file.py` | 注入文件内容 |
| `@file:path/to/file.py:10-25` | 注入特定行范围（1 索引、包含） |
| `@folder:path/to/dir` | 注入目录树列表与文件元数据 |
| `@diff` | 注入 `git diff`（未暂存工作树改变） |
| `@staged` | 注入 `git diff --staged`（暂存改变） |
| `@git:5` | 注入最后 N 个提交与补丁（最大 10） |
| `@url:https://example.com` | 获取和注入网页内容 |

## 使用示例

```text
审查 @file:src/main.py 并建议改进

什么改变了？@diff

比较 @file:old_config.yaml 和 @file:new_config.yaml

@folder:src/components 中有什么？

总结这篇文章 @url:https://arxiv.org/abs/2301.00001
```

多个引用在单个消息中工作：

```text
检查 @file:main.py，也 @file:test.py。
```

末尾标点（`,`、`.`、`;`、`!`、`?`）从引用值自动去除。

## CLI 标签补全

在交互式 CLI 中，输入 `@` 触发自动补全：

- `@` 显示所有引用类型（`@diff`、`@staged`、`@file:`、`@folder:`、`@git:`、`@url:`）
- `@file:` 和 `@folder:` 触发文件系统路径补全与文件大小元数据
- 赤裸 `@` 跟随部分文本显示匹配文件和当前目录的文件夹

## 行范围

`@file:` 引用支持行范围用于精确内容注入：

```text
@file:src/main.py:42        # 单个行 42
@file:src/main.py:10-25     # 行 10 到 25（包含）
```

行是 1 索引。无效范围静默忽略（完整文件被返回）。

## 大小限制

上下文引用被限制以防止压倒模型的上下文窗口：

| 阈值 | 值 | 行为 |
|-----------|-------|----------|
| 软限制 | 上下文长度的 25% | 附加警告、扩展继续 |
| 硬限制 | 上下文长度的 50% | 扩展被拒绝、原始消息返回未改变 |
| 文件夹项目 | 200 个文件最多 | 超额项目用 `- ...` 替换 |
| Git 提交 | 最多 10 | `@git:N` 钳制到范围 [1, 10] |

## 安全

### 敏感路径阻止

这些路径总是从 `@file:` 引用中阻止以防止凭证暴露：

- SSH 键和配置：`~/.ssh/id_rsa`、`~/.ssh/id_ed25519`、`~/.ssh/authorized_keys`、`~/.ssh/config`
- Shell 配置文件：`~/.bashrc`、`~/.zshrc`、`~/.profile`、`~/.bash_profile`、`~/.zprofile`
- 凭证文件：`~/.netrc`、`~/.pgpass`、`~/.npmrc`、`~/.pypirc`
- Hermes env：`$HERMES_HOME/.env`

这些目录被完全阻止（任何文件内部）：
- `~/.ssh/`、`~/.aws/`、`~/.gnupg/`、`~/.kube/`、`$HERMES_HOME/skills/.hub/`

### 路径遍历保护

所有路径相对于工作目录解析。解析在允许的工作区根外的引用被拒绝。

### 二进制文件检测

二进制文件通过 MIME 类型和空字节扫描检测。已知文本扩展（`.py`、`.md`、`.json`、`.yaml`、`.toml`、`.js`、`.ts` 等）绕过基于 MIME 的检测。二进制文件被拒绝带警告。

## 平台可用性

上下文引用主要是一个 **CLI 功能**。他们在交互式 CLI 中工作其中 `@` 触发标签补全和引用在消息发送到 Agent 前被扩展。

在**消息传递平台**（Telegram、Discord 等）中，`@` 语法不被网关扩展 — 消息按原样传递。Agent 本身仍然可以通过 `read_file`、`search_files` 和 `web_extract` 工具引用文件。

## 与上下文压缩的交互

当对话上下文被压缩时，扩展的引用内容被包含在压缩摘要中。这意味着：

- 通过 `@file:` 注入的大文件内容贡献到上下文使用
- 如果对话稍后被压缩，文件内容被总结（未逐字保留）
- 对于非常大的文件，考虑使用行范围（`@file:main.py:100-200`）以仅注入相关部分

## 常见模式

```text
# 代码审查工作流
审查 @diff 并检查安全问题

# 与上下文调试
这个测试失败。这是测试 @file:tests/test_auth.py
和实现 @file:src/auth.py:50-80

# Project 探索
这个 project 做什么？@folder:src @file:README.md

# 研究
比较方法在 @url:https://arxiv.org/abs/2301.00001
和 @url:https://arxiv.org/abs/2301.00002
```

## 错误处理

无效引用产生内联警告而不是失败：

| 条件 | 行为 |
|-----------|----------|
| 文件未找到 | 警告："file not found" |
| 二进制文件 | 警告："binary files are not supported" |
| 文件夹未找到 | 警告："folder not found" |
| Git 命令失败 | 警告与 git stderr |
| URL 返回无内容 | 警告："no content extracted" |
| 敏感路径 | 警告："path is a sensitive credential file" |
| 路径在工作区外 | 警告："path is outside the allowed workspace" |
