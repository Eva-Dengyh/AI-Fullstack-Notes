# 用 mdBook + GitHub Pages 搭建个人技术笔记站：从零到上线的完整流程

> **场景**：你有一堆 Markdown 笔记，想把它们整理成一本可在线访问、带导航、支持搜索的"技术书"，并且每次 `git push` 就自动发布到网上。mdBook + GitHub Pages + GitHub Actions 可以在 30 分钟内帮你做到这一切，还是完全免费的。

本文覆盖：
- 本地安装与初始化
- 目录结构与 `SUMMARY.md` 编写规则
- `book.toml` 完整配置说明
- 自定义外观（主题色、字体、favicon）
- GitHub Actions 自动部署、`.gitignore` 与 Pages 设置
- 文末 **「十一、常见错误与修复」** 速查表

---

## 一、前置条件

| 工具 | 版本要求 | 说明 |
|------|---------|------|
| Rust / Cargo | 任意稳定版 | 用于通过 `cargo install` 安装 mdBook |
| Git | ≥ 2.x | 版本管理与推送 |
| GitHub 账号 | — | 托管仓库 + Pages 部署 |

如果你不想安装 Rust，也可以直接从 [GitHub Releases](https://github.com/rust-lang/mdBook/releases) 下载编译好的二进制文件，放到 `PATH` 即可。

---

## 二、安装 mdBook

### 方式 A：通过 Cargo 安装（推荐）

```bash
cargo install mdbook
```

安装完成后验证：

```bash
mdbook --version
# 常见为 v0.5.x（与 CI 里 mdbook-version: "latest" 一致）
# 若需与旧版插件兼容，可固定为 0.4.x，例如：cargo install mdbook --locked --version 0.4.52
```

### 方式 B：下载二进制（无需 Rust）

```bash
# macOS (Apple Silicon)
curl -L https://github.com/rust-lang/mdBook/releases/latest/download/mdbook-aarch64-apple-darwin.tar.gz \
  | tar xz -C /usr/local/bin

# Linux x86_64
curl -L https://github.com/rust-lang/mdBook/releases/latest/download/mdbook-x86_64-unknown-linux-gnu.tar.gz \
  | tar xz -C /usr/local/bin
```

---

## 三、初始化项目

### 3.1 全新项目

```bash
mdbook init my-notes
cd my-notes
```

`init` 会生成如下结构：

```
my-notes/
├── book.toml        # 核心配置文件
└── src/
    ├── SUMMARY.md   # 目录（mdBook 的"地图"）
    └── chapter_1.md
```

### 3.2 已有 Markdown 仓库接入

如果你已经有一个 git 仓库，里面放着若干 `.md` 文件，可以直接在根目录：

```bash
mdbook init --force .
```

然后手动调整 `book.toml` 中的 `src` 路径（下一节详解）。

**注意**：`mdbook build` 的默认输出目录是仓库根下的 **`book/`**。请尽早添加根目录 **`.gitignore`** 中的 `book/`（见第九节），**不要**把 `book/` 当成子模块提交；否则既没有 `.gitmodules` 里的 URL，又会在 CI 的 `actions/checkout` 拉子模块时报错。

---

## 四、book.toml 完整配置详解

`book.toml` 是 mdBook 的核心配置，使用 [TOML](https://toml.io) 格式。以下是一份生产可用的完整配置，带逐行注释：

```toml
# ── 书籍基本信息 ──────────────────────────────────────────
[book]
title       = "AI-Fullstack-Notes"          # 显示在左上角的书名
description = "全栈工程师的 AI/Agent 学习笔记"
authors     = ["Eva"]
language    = "zh"                           # 界面语言（影响搜索分词）
src         = "."                            # Markdown 源文件根目录
                                             # 默认 "src"；改成 "." 表示仓库根目录即源目录

# ── HTML 输出配置 ─────────────────────────────────────────
[output.html]
site-url = "/AI-Fullstack-Notes/"           # GitHub Pages 子路径，必须与仓库名一致
                                             # 本地预览时注释掉此行，否则资源路径会错

git-repository-url  = "https://github.com/Eva-Dengyh/AI-Fullstack-Notes"
# mdBook 0.5+：品牌图标 fa-github 等会触发构建错误 Missing font github，请省略 git-repository-icon。
# git-repository-icon = "fa-github"

# 每个页面底部显示"在 GitHub 上编辑此页"链接
edit-url-template = "https://github.com/Eva-Dengyh/AI-Fullstack-Notes/edit/main/{path}"

# 其他常用可选项（按需启用）：
# theme            = "coal"                 # 默认主题：light/rust/coal/navy/ayu
# default-theme    = "light"               # 读者首次打开时的主题
# preferred-dark-theme = "navy"            # 系统暗色模式时使用的主题
# mathjax-support  = true                  # 启用 LaTeX 数学公式
# no-section-label = true                  # 目录标题前不显示章节编号
# additional-css   = ["theme/custom.css"]  # 自定义 CSS
# additional-js    = ["theme/custom.js"]   # 自定义 JS
# search.enable    = true                  # 默认开启全文搜索
```

> **关键踩坑点**：`site-url` 必须与你的 GitHub 仓库名完全一致（含大小写），否则部署后图片、CSS 路径全部 404。

---

## 五、SUMMARY.md 编写规则

`SUMMARY.md` 是 mdBook 读取目录结构的唯一入口，**文件路径相对于 `src` 目录**（即 `book.toml` 中 `src` 指定的目录）。

### 5.1 基本语法

```markdown
# 目录

<!-- 前言：不计入章节编号，显示在最顶部 -->
[前言](README.md)

---

# 一级分组标题（纯文本，不可点击）

- [章节标题](path/to/file.md)
  - [子章节](path/to/sub.md)
    - [孙章节](path/to/subsub.md)

# 另一个分组

- [另一章](another.md)

---

<!-- 后记：不计入章节编号 -->
[附录](appendix.md)
```

### 5.2 实战示例（本项目的 SUMMARY.md 结构）

```markdown
# 目录

[前言](README.md)

---

# AI / Agent

- [LangChain 架构浅析](ai/langchain-architecture.md)
- [LangGraph — 通过图结构重新定义 LLM 应用](ai/langgraph-intro.md)
- [RAG 实战：从手写 MVP 到生产级优化](ai/rag-mvp-to-production.md)

# 架构 / 后端

- [高并发架构设计思考](backend/high-concurrency-architecture.md)
- [Nginx 全解析：反向代理与负载均衡](backend/nginx-reverse-proxy-load-balance.md)

# 基础设施 / 运维

- [Docker 基础与 Dockerfile 编写](infra/docker-basics-dockerfile.md)
- [5 分钟用 Docker 自建 Supabase](infra/supabase-docker-self-host.md)
```

### 5.3 规则速查

| 规则 | 说明 |
|------|------|
| `[标题](路径)` | 只有列在这里的文件才会出现在书中 |
| `---` | 水平分隔线，仅用于视觉分隔 |
| `# 标题` | 分组标题，不可点击，不生成页面 |
| 缩进（2 或 4 空格） | 表示子章节，可无限嵌套 |
| 文件路径 | 相对于 `src` 目录；未列出的 `.md` 文件不会被编译 |

---

## 六、本地预览

```bash
# 启动本地开发服务器，文件变动自动刷新
mdbook serve --open

# 仅构建，不启动服务器
mdbook build
# 输出目录：./book/
```

> 本地预览时，如果 `book.toml` 设置了 `site-url = "/AI-Fullstack-Notes/"`，访问 `http://localhost:3000` 时页面会空白。临时注释掉该行，或用 `http://localhost:3000/AI-Fullstack-Notes/` 访问。

---

## 七、自定义外观（可选）

### 7.1 覆盖主题变量

在项目根目录创建 `theme/` 文件夹，添加 `custom.css`：

```css
/* theme/custom.css */
:root {
  --sidebar-bg: #1a1a2e;        /* 侧边栏背景色 */
  --sidebar-fg: #e0e0e0;        /* 侧边栏文字色 */
  --links: #4fc3f7;             /* 链接颜色 */
}
```

在 `book.toml` 中引用：

```toml
[output.html]
additional-css = ["theme/custom.css"]
```

### 7.2 添加 favicon

```bash
mkdir -p theme
cp your-favicon.png theme/favicon.png
# 或 .ico 格式
cp your-favicon.ico theme/favicon.ico
```

mdBook 会自动识别 `theme/favicon.png` 或 `theme/favicon.ico`，无需额外配置。

### 7.3 启用 MathJax（数学公式）

```toml
[output.html]
mathjax-support = true
```

使用时：

```markdown
行内公式：$E = mc^2$

块级公式：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

---

## 八、GitHub Actions 自动部署

### 8.1 目录结构

```
your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml   ← 新建此文件
├── book.toml
├── SUMMARY.md
├── .gitignore           ← 建议：忽略 book/（见第九节）
└── ...（你的 .md 文件）
```

### 8.2 deploy.yml 完整内容

```yaml
name: Deploy mdBook to GitHub Pages

on:
  push:
    branches:
      - main          # 只有推送到 main 分支才触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # 必须：允许 Actions 向仓库写入（gh-pages 分支）

    steps:
      - uses: actions/checkout@v4
        with:
          submodules: false   # 若误把 book/ 登记成 submodule 且无 .gitmodules，拉子模块会失败；显式关闭更稳妥

      - name: Install mdBook
        uses: peaceiris/actions-mdbook@v2
        with:
          mdbook-version: "latest"   # 可固定版本号，如 "0.4.52"（需与本地/插件兼容时再考虑）

      - name: Build
        run: mdbook build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./book        # 只发布构建产物，勿把整个仓库推到 gh-pages
          # force_orphan: true      # 可选：每次用单提交覆盖 gh-pages，清掉历史上误提交的源码/混杂文件
```

### 8.3 GitHub 仓库设置

1. 进入仓库 → **Settings** → **Pages**
2. Source 选择 **Deploy from a branch**
3. Branch 选择 `gh-pages`，目录选 `/ (root)`
4. 点击 **Save**

> **Pages 源不要选错：**
>
> - **不要** `main` + **`/docs`**：会跑 **Jekyll**（日志里常见 `jekyll-build-pages`、`Source: .../docs`）。没有 Jekyll 项目时会报 **`/docs` 目录不存在**。
> - **不要** `main` + **`/ (root)`**：GitHub 仍会用 Jekyll 处理仓库，首页往往是 **`README.md`**，看起来像「单页文档」，**不是 mdBook 的书本界面**。在线阅读必须来自 **`gh-pages`** 上的静态文件。
> - **正确**：**`gh-pages` + `/ (root)`**（内容由上一节的 `deploy.yml` 把 **`./book/`** 推送到 `gh-pages`）。

第一次 `git push main` 后，Actions 跑完（约 1-2 分钟），访问：

```
https://<你的用户名>.github.io/<仓库名>/
```

### 8.4 工作流说明

```
git push main
     │
     ▼
GitHub Actions 触发
     │
     ├─ actions/checkout@v4        # 拉取代码（submodules: false）
     ├─ peaceiris/actions-mdbook@v2 # 安装 mdBook 二进制
     ├─ mdbook build               # 编译 → ./book/
     └─ peaceiris/actions-gh-pages@v4
           └─ 将 ./book/ 推送到 gh-pages 分支
                    │
                    ▼
           GitHub Pages 自动部署
```

---

## 九、.gitignore 配置

构建输出目录 **`book/`** 应加入忽略，避免：

- 把大量生成文件提交进 `main`；
- 误将 **`book/` 登记为 git submodule**（索引里出现 `160000` 模式且无 `.gitmodules` 时，CI 在拉子模块阶段会报 **`No url found for submodule path 'book'`**）。

```gitignore
# mdBook 构建输出（勿提交；勿误登记为 submodule）
book/
```

---

## 十、项目最终结构参考

```
AI-Fullstack-Notes/
├── .github/
│   └── workflows/
│       └── deploy.yml        # CI/CD 自动部署
├── ai/
│   ├── langchain-architecture.md
│   └── rag-mvp-to-production.md
├── backend/
│   └── high-concurrency-architecture.md
├── infra/
│   └── docker-basics-dockerfile.md
├── projects/
│   └── fastsam-demo-v1.md
├── theme/
│   ├── custom.css            # 可选：自定义样式
│   └── favicon.png           # 可选：网站图标
├── book.toml                 # 核心配置
├── SUMMARY.md                # 目录结构
├── README.md                 # 前言/首页
└── .gitignore                # 排除 book/
```

---

## 十一、常见错误与修复

| 现象 | 原因与处理 |
|------|------------|
| **`Missing font github`**，`Error rendering "index" line …` | mdBook **0.5+** 与 **`git-repository-icon = "fa-github"`** 等品牌图标不兼容。第四节：注释掉 **`git-repository-icon`**；`index` 指内置模板而非某篇 Markdown 行号。 |
| **`No url found for submodule path 'book' in .gitmodules`** | 曾把 **`book/`** 误登记为子模块。从索引移除该 gitlink（`git rm --cached book`），根目录保留 **`.gitignore`** 的 `book/`，**`deploy.yml`** 里 **`submodules: false`**（第八节）。 |
| **Jekyll 报错 `/docs` 不存在** | Pages 选成了 **`main` + `/docs`**。改为 **`gh-pages` + `/ (root)`**（第八节）。 |
| **网站只有 README、没有 mdBook 侧栏** | Pages 指向 **`main`**（含 `/ (root)`）而非 **`gh-pages`**。改为 **`gh-pages` + `/ (root)`**，并确认 **Deploy mdBook** 工作流已成功跑完。 |
| **`gh-pages` 上混有 `book.toml`、`ai/` 等源码** | 历史部署曾把整仓推上去。之后应用 **`publish_dir: ./book`**；必要时在 **`peaceiris/actions-gh-pages`** 上启用 **`force_orphan: true`** 做一次干净覆盖（第八节 YAML 注释）。 |

---

## 总结

| 步骤 | 操作 |
|------|------|
| 1 | `cargo install mdbook` 或下载二进制 |
| 2 | `mdbook init` 或在已有仓库根目录添加 `book.toml` |
| 3 | 编写 `SUMMARY.md` 定义目录结构 |
| 4 | 配置 `book.toml`（重点：`src`、`site-url`；0.5+ 勿启用 `fa-github` 图标） |
| 5 | 根目录 `.gitignore` 加入 `book/` |
| 6 | `mdbook serve` 本地预览 |
| 7 | 添加 `.github/workflows/deploy.yml`（`checkout` 建议 `submodules: false`） |
| 8 | GitHub Pages：**`gh-pages` + `/ (root)`**，勿用 `main` |
| 9 | `git push main` → Actions 构建并更新 `gh-pages` |

整个流程下来，你得到的是：一个**自动化发布**、**全文可搜索**、**支持暗色模式**、**免费托管**的技术知识库。以后在 **`main`** 上改 Markdown 并 `git push`，由 Actions 重新 **`mdbook build`** 后更新 **`gh-pages`**；读者通过 Pages 绑定的 **`gh-pages` 根目录**访问的才是 mdBook 站点。
