# Ubuntu 安装 Redis 并配置远程连接指南

## 1. 更新包列表

```bash
sudo apt update
```

## 2. 安装 Redis

```bash
sudo apt install redis-server -y
```

## 3. 启动并设置开机自启

```bash
sudo systemctl enable redis-server
```

## 4. 验证

```bash
sudo systemctl status redis-server
```

## 5. 基本配置

```bash
sudo vim /etc/redis/redis.conf
```

修改以下项：

```conf
# 允许外部连接（默认只允许本机）
bind 0.0.0.0

# 关闭保护模式
protected-mode no

# 设置密码（必须！否则裸奔极易被入侵挖矿）
requirepass 强密码
```

| 配置项 | 说明 | 建议值 |
|--------|------|--------|
| `bind` | 监听地址 | 仅本机用 `127.0.0.1`，需远程访问改为 `0.0.0.0` |
| `requirepass` | 设置密码 | 生产环境必须设置 |
| `maxmemory` | 最大内存限制 | 如 `256mb` |
| `supervised` | 进程管理方式 | 改为 `systemd` |

## 6. 重启生效

```bash
sudo systemctl restart redis-server
```

## 7. 开放防火墙端口

```bash
sudo ufw allow 6379/tcp
```

> **注意**：如果是云服务器（腾讯云/阿里云等），还需要在云控制台的安全组中放行 6379 端口的入站规则。

## 8. 本地连接

```bash
redis-cli -h 你的服务器公网IP -p 6379 -a 你的强密码
```

连上后输入 `ping`，返回 `PONG` 即成功。

---

## 排查连接问题

如果连接不上，可以逐步排查：

### 1. 确认服务端 Redis 是否在运行

```bash
# 在线上服务器执行
sudo systemctl status redis-server
```

### 2. 检查 Redis 监听地址

```bash
sudo grep "^bind" /etc/redis/redis.conf
```

确保是 `bind 0.0.0.0`，而不是 `bind 127.0.0.1`。

### 3. 确认 Redis 实际监听端口

```bash
sudo ss -tlnp | grep 6379
```

正常应显示 `0.0.0.0:6379`，如果是 `127.0.0.1:6379` 说明 bind 没改对或没重启。

### 4. 检查防火墙

```bash
sudo ufw status
```

确认 6379 已放行。

### 5. 检查云服务器安全组

去云控制台 → 安全组 → 入站规则，添加：

| 协议 | 端口 | 来源 |
|------|------|------|
| TCP | 6379 | 0.0.0.0/0 |
