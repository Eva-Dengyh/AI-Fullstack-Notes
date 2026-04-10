# GitHub 主页进化论：三步定制专属 README 模版

## 第一步：创建你的个人主页仓库

如果还没创建过，需要先建立一个特殊的仓库：

1. 在 GitHub 上新建一个仓库。

2. 仓库名必须和你的 **GitHub 用户名** 完全一致（区分大小写）。

3. 勾选 **Add a README file**。

4. 创建后，这个仓库的 `README.md` 就会显示在你的个人主页顶部。

## 第二步：挑选并复制模版

模版库地址：https://github.com/kautukkundan/Awesome-Profile-README-templates/tree/master

这个仓库里的模版按风格分成了几个文件夹，可以进去挑选：

- **short-and-sweet**：简洁风格。
- **code-styled**：极客风格，看起来像代码编辑器。
- **dynamic-realtime**：动态实时更新（通常需要配合 GitHub Actions）。
- **elaborate**：内容详尽，包含很多图表和介绍。
- **multimedia**：包含多媒体元素（GIF 等）。

### 套用方法

1. **浏览文件夹**：点击进入上述任一文件夹。

2. **打开文件**：你会看到很多以用户名命名的 `.md` 文件（例如 `saviomartin.md`）。点击你觉得好看的文件。

3. **复制代码**：

   - **情况 A（直接有代码）**：如果文件里包含大量的 Markdown 代码（如徽章链接、自我介绍文本），直接点击文件右上角的 **Copy raw file** 按钮复制全部内容。

   - **情况 B（只有图片/链接）**：有些文件可能只展示了一张效果图和一个链接（如 "From xxxx"）。这时你需要点击那个链接跳转到原作者的主页，找到原作者同名仓库（`username/username`）里的 `README.md`，然后复制那里的代码。

## 第三步：修改与个性化

将复制的代码粘贴到你自己仓库的 `README.md` 中。这一步最关键，因为直接保存会显示别人的信息。你需要做全局替换：

1. **替换用户名**：使用文本编辑器的"查找替换"功能，将模版原作者的用户名（例如 `saviomartin`）全部替换为你自己的 GitHub 用户名。这会自动修复你的统计卡片、徽章和链接。

2. **修改个人信息**：
   - 修改自我介绍（"Hi, I'm..."）。
   - 修改社交媒体链接（Twitter, LinkedIn 等）。
   - 修改技能图标（删除你不会的，添加你会的）。

3. **保存提交**：点击 **Commit changes** 保存。

## 最终实现效果

页面效果参考代码见：https://github.com/Eva-Dengyh/Eva-Dengyh/edit/main/README.md
