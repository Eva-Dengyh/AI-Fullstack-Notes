# Hermes Agent 文档说明

本仓库的 **mdBook 在线书** 目前**不收录** Hermes Agent 上游文档的全量章节（`getting-started/`、`user-guide/`、`developer-guide/` 等目录下的成百上千个页面）。

这样做的原因：

- 若仅在 `SUMMARY.md` 里列出路径、而磁盘上**没有对应 `.md` 文件**，mdBook 要么构建失败，要么在旧部署里出现**大量空白章节**。
- 上游文档适合用 **git submodule**、**同步脚本** 或 **单独子仓库** 维护，再接入本书；不要在本仓库里「只写目录、不写正文」。

## 在本仓库里能读什么

- **个人实战笔记（推荐）**：[Hermes Agent 系列](../projects/hermes-agent/README.md)（含本地启动与项目结构等）。
- 若你已在本地克隆了 **Hermes Agent 官方文档仓库**，可自行把该目录以 submodule 挂到 `hermes-agent/`，补全文件后再把对应条目加回 `SUMMARY.md`。

## 自行接入上游文档（简述）

1. 在官方仓库取得与本书此前 `SUMMARY.md` 一致或兼容的目录结构。  
2. `git submodule add <官方仓库 URL> hermes-agent`（或同步到同名目录）。  
3. 确认 `mdbook build` 无缺失文件后，再逐步恢复 `SUMMARY.md` 中的章节链接。

在此之前，本书侧栏**不再展示**未落地文件的 Hermes 章节，避免出现空页。
