---
name: deploy-github-pages
description: Deploy the knowledge-nav project to GitHub Pages by updating sitemap, committing, and pushing. Use when the user asks to deploy, publish, push updates, or sync content to the live site at cornucopib.github.io/knowledge-nav.
---

# 部署到 GitHub Pages

## 部署流程

1. **更新站点地图**
   运行脚本重新扫描目录结构：
   ```bash
   node generate-sitemap.js
   ```

2. **提交并推送**
   ```bash
   git add -A
   git commit -m "deploy: 更新内容"
   git push
   ```

3. **等待部署**
   GitHub Actions 自动构建部署，约 1-2 分钟生效。

4. **验证**
   打开 `https://cornucopib.github.io/knowledge-nav/` 确认上线。
