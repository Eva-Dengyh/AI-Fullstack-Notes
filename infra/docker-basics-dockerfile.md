# Docker 教程：基础命令概念 & Dockerfile

## 1. Docker 基础概念

### 1.1 什么是 Docker

Docker 的出现是为了解决软件开发过程中的环境配置问题。软件的运行需要满足两个核心条件：操作系统配置正确，依赖库和组件完整安装。以 Python 应用为例，用户的电脑必须配备 Python 运行时环境、各种第三方依赖包、正确的环境变量配置。当老旧模块和新环境产生冲突时，兼容性更是麻烦的问题。在此背景下诞生了 Docker。

Docker 是一个开源的容器化平台，它使用操作系统级别的虚拟化技术，将应用程序及其依赖项打包到一个轻量级、可移植的容器中。容器可以在任何支持 Docker 的环境中运行，确保应用程序的一致性和可移植性。

### 1.2 核心概念

**Container（容器）**

容器是镜像的运行实例，就像是一个独立运行的小型虚拟环境。它本质上是一个被隔离的进程，拥有自己的文件系统、网络和进程空间，但与宿主机共享操作系统内核。就像面向对象编程中从"类"创建出来的"对象"一样，一个镜像可以启动多个容器实例，每个容器都有自己的运行状态和数据。

**Image（镜像）**

镜像是一个只读的模板文件，包含了运行某个应用程序所需的完整环境：代码、运行时库、系统工具、环境变量、配置文件等所有依赖。它就像面向对象编程中的"类"定义，描述了容器应该是什么样子，但本身不能直接运行，需要通过镜像来创建和启动容器实例。

**Dockerfile**

Dockerfile 是一个纯文本文件，包含了一系列构建镜像的指令和命令。它定义了从选择基础镜像开始，到安装依赖、复制代码、设置环境变量、暴露端口等一步步构建最终镜像的完整过程。相当于是制作镜像的"配方"或"脚本"，让镜像构建过程可重复、可版本控制。

**Repository（仓库）**

仓库是存储和分发镜像的中心化服务，就像代码的 Git 仓库一样。Docker Hub 是最大的公共镜像仓库，提供了大量官方和社区维护的镜像供下载使用。企业也可以搭建私有仓库来存储内部镜像，实现镜像的版本管理、分发和共享。

### 1.3 Docker vs 传统虚拟机

| 特性 | Docker 容器 | 传统虚拟机 |
|------|------------|-----------|
| 启动时间 | 秒级启动 | 分钟级启动 |
| 资源占用 | 轻量级，共享内核 | 重量级，独立 OS |
| 性能 | 接近原生性能 | 有一定性能损耗 |
| 隔离性 | 进程级隔离 | 硬件级隔离 |
| 可移植性 | 高度可移植 | 相对较低 |

### 1.4 Docker 安装与配置

网上已有很多安装配置教程，不再赘述，具体可参考官网：https://docs.docker.com/desktop/

### 1.5 Docker 基础命令

Docker 常用指令：https://www.runoob.com/docker/docker-command-manual.html

---

## 2. Dockerfile 编写指南

### 2.1 基本语法

```dockerfile
# 基础镜像 - 必须是第一条指令
FROM ubuntu:20.04

# 设置工作目录
WORKDIR /app

# 复制文件到容器
COPY . .
COPY requirements.txt /app/

# 添加文件（支持 URL 和自动解压）
ADD https://example.com/file.tar.gz /tmp/

# 执行命令（构建时）
RUN apt-get update && apt-get install -y python3

# 暴露端口
EXPOSE 8080

# 设置环境变量
ENV NODE_ENV=production

# 容器启动命令
CMD ["python3", "app.py"]
```

### 2.2 常用指令

| 指令 | 作用 | 示例 |
|------|------|------|
| `FROM` | 指定基础镜像 | `FROM node:16-alpine` |
| `RUN` | 执行 Shell 命令 | `RUN npm install` |
| `COPY` | 复制本地文件 | `COPY src/ /app/src/` |
| `ADD` | 复制文件（功能更多） | `ADD file.tar.gz /tmp/` |
| `WORKDIR` | 设置工作目录 | `WORKDIR /usr/src/app` |
| `EXPOSE` | 声明端口 | `EXPOSE 3000` |
| `ENV` | 设置环境变量 | `ENV PATH=/app:$PATH` |
| `CMD` | 默认启动命令 | `CMD ["npm", "start"]` |
| `ENTRYPOINT` | 入口点命令 | `ENTRYPOINT ["java", "-jar"]` |

### 2.3 示例：Python Flask 应用

```dockerfile
# 使用官方 Python 镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000

# 设置环境变量
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 启动命令
CMD ["flask", "run", "--host=0.0.0.0"]
```

---

## 3. Docker 核心优势

- **一致性**：确保开发、测试、生产环境一致
- **可移植性**：在任何支持 Docker 的环境中运行
- **资源效率**：比传统虚拟机更轻量级
- **快速部署**：秒级启动和扩展
