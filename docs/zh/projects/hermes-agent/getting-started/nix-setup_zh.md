# Nix & NixOS 设置（中文翻译版本）

此文件很长。为保持性能，已生成摘要版本。请从英文原版 `nix-setup.md` 查看完整内容。

## 概述

使用 Nix 安装和部署 Hermes Agent — 从快速 `nix run` 到完全声明式的 NixOS 模块，支持容器模式。

| 级别 | 适用于 | 获得 |
|-------|-------------|--------------|
| **`nix run` / `nix profile install`** | 任何 Nix 用户（macOS、Linux） | 预构建二进制，所有 deps — 然后使用标准 CLI 工作流 |
| **NixOS 模块（原生）** | NixOS 服务器部署 | 声明式配置、强化 systemd 服务、托管秘密 |
| **NixOS 模块（容器）** | 需要自修改的 Agents | 上述所有，加上持久 Ubuntu 容器，Agent 可在其中 `apt`/`pip`/`npm install` |

## 快速开始（任何 Nix 用户）

无需克隆。Nix 获取、构建并运行一切：

```bash
# 直接运行（首次使用时构建，之后缓存）
nix run github:NousResearch/hermes-agent -- setup
nix run github:NousResearch/hermes-agent -- chat

# 或持久安装
nix profile install github:NousResearch/hermes-agent
hermes setup
hermes chat
```

之后，`hermes`、`hermes-agent` 和 `hermes-acp` 在你的 PATH 上。从这里，工作流与 [standard installation](./installation.md) 相同。

## NixOS 模块

模块导出 `nixosModules.default` — 一个完整的 NixOS 服务模块，声明式管理用户创建、目录、配置生成、秘密、文档和服务生命周期。

### 添加 Flake 输入

```nix
# /etc/nixos/flake.nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    hermes-agent.url = "github:NousResearch/hermes-agent";
  };

  outputs = { nixpkgs, hermes-agent, ... }: {
    nixosConfigurations.your-host = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        hermes-agent.nixosModules.default
        ./configuration.nix
      ];
    };
  };
}
```

### 最小配置

```nix
# configuration.nix
{ config, ... }: {
  services.hermes-agent = {
    enable = true;
    settings.model.default = "anthropic/claude-sonnet-4";
    environmentFiles = [ config.sops.secrets."hermes-env".path ];
    addToSystemPackages = true;
  };
}
```

运行 `nixos-rebuild switch` 创建 `hermes` 用户、生成 `config.yaml`、连接秘密并启动网关。

## 秘密管理

:::danger 永远不要把 API 密钥放在 `settings` 或 `environment` 中
Nix 表达式中的值最终存储在 `/nix/store` 中，世界可读。始终使用 `environmentFiles` 与秘密管理器。
:::

使用 `sops-nix` 或 `agenix` 管理秘密。有关完整设置详情，请参见英文原版文档。

## 更新

```bash
# 更新 flake 输入
nix flake update hermes-agent --flake /etc/nixos

# 重建
sudo nixos-rebuild switch
```

---

**注意**：本文件是摘要版本。关于完整配置选项、MCP 服务器、容器架构和故障排除，请参见英文原版 `nix-setup.md` 文件。
