---
title: 图像生成
description: 使用 FLUX 2 Pro 通过 FAL.ai 和通过 Clarity Upscaler 的自动升采样生成高质量图像。
sidebar_label: 图像生成
---

# 图像生成

Hermes Agent 可用 FAL.ai 的 **FLUX 2 Pro** 模型从文本提示生成图像，并通过 **Clarity Upscaler** 进行自动 2x 升采样以增强质量。

## 设置

### 获取 FAL API 密钥

1. 在 [fal.ai](https://fal.ai/) 注册
2. 从你的仪表板生成 API 密钥

### 配置密钥

```bash
# 添加到 ~/.hermes/.env
FAL_KEY=your-fal-api-key-here
```

### 安装客户端库

```bash
pip install fal-client
```

:::info
当 `FAL_KEY` 被设置时，图像生成工具自动可用。无需额外工具集配置。
:::

## 工作原理

当你要求 Hermes 生成图像时：

1. **生成** — 你的提示被发送到 FLUX 2 Pro 模型（`fal-ai/flux-2-pro`）
2. **升采样** — 生成的图像使用 Clarity Upscaler（`fal-ai/clarity-upscaler`）自动升采样 2x
3. **发送** — 升采样的图像 URL 被返回

如果升采样因任何原因失败，原始图像作为回退被返回。

## 使用

简单要求 Hermes 创建图像：

```
生成一幅宁静的山地风景与樱花的图像
```

```
创建一幅坐在古树枝上的智慧老鹰的肖像
```

```
为我制作一个未来城市景观，带飞行汽车和霓虹灯
```

## 参数

`image_generate_tool` 接受这些参数：

| 参数 | 默认值 | 范围 | 描述 |
|-----------|---------|-------|-------------|
| `prompt` | *（必需）* | — | 所需图像的文本描述 |
| `aspect_ratio` | `"landscape"` | `landscape`, `square`, `portrait` | 图像宽高比 |
| `num_inference_steps` | `50` | 1–100 | 去噪步数（更多 = 更高质量、更慢） |
| `guidance_scale` | `4.5` | 0.1–20.0 | 紧跟提示程度 |
| `num_images` | `1` | 1–4 | 要生成的图像数 |
| `output_format` | `"png"` | `png`, `jpeg` | 图像文件格式 |
| `seed` | *（随机）* | 任何整数 | 用于可重复结果的随机种子 |

## 宽高比

工具使用映射到 FLUX 2 Pro 图像大小的简化宽高比名称：

| 宽高比 | 映射到 | 最好用于 |
|-------------|---------|----------|
| `landscape` | `landscape_16_9` | 壁纸、横幅、场景 |
| `square` | `square_hd` | 头像、社交媒体帖子 |
| `portrait` | `portrait_16_9` | 人物艺术、手机壁纸 |

:::tip
你也可直接使用原始 FLUX 2 Pro 大小预设：`square_hd`、`square`、`portrait_4_3`、`portrait_16_9`、`landscape_4_3`、`landscape_16_9`。还支持最大 2048x2048 的自定义大小。
:::

## 自动升采样

每个生成的图像使用 FAL.ai 的 Clarity Upscaler 自动升采样 2x，设置如下：

| 设置 | 值 |
|---------|-------|
| 升采样因子 | 2x |
| 创意 | 0.35 |
| 相似度 | 0.6 |
| 指导规模 | 4 |
| 推理步数 | 18 |

这产生比原始 FLUX 输出更高分辨率、更清晰的图像。
