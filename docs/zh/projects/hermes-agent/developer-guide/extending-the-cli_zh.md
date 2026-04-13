---
title: "扩展 CLI"
description: "如何通过 wrapper CLI 和 TUI hook 扩展 Hermes CLI。"
---

# 扩展 CLI

Hermes CLI 提供若干扩展点，允许你在不重写主 CLI 的情况下加入自定义 TUI 组件、快捷键或布局。

## 扩展点

常见扩展点包括：

- 额外 TUI widgets；
- 额外 keybindings；
- 自定义 layout children；
- wrapper CLI。

## 快速开始：wrapper CLI

推荐方式是写一个轻量 wrapper，复用 Hermes CLI 的主体逻辑，只在需要的位置注入自定义行为。这样能降低与上游 CLI 变更冲突的概率。

## Hook 参考

### `_get_extra_tui_widgets()`

返回额外 TUI 组件，供主 layout 使用。

### `_register_extra_tui_keybindings(kb, *, input_area)`

注册额外快捷键。实现时要避免覆盖核心快捷键，除非你明确知道后果。

### `_build_tui_layout_children(**widgets)`

在 layout 层加入额外组件或调整组件顺序。

## Layout 图

CLI TUI 通常由输入区、消息区、状态区和可选侧边/底部组件组成。扩展时应尽量保持用户已有操作习惯，不要让核心输入路径变复杂。

## Tips

- 优先用 hook，而不是复制整份 CLI。
- 避免依赖内部不稳定变量。
- 让新增 UI 在终端尺寸不足时能退化。
- 快捷键要有清晰文档。
- 如果扩展会进入通用功能，考虑提交 upstream PR。
