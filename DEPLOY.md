# 10大帝博客 - Vercel 部署指南

## 部署前准备

### 1. 注册 Vercel 账号
- 访问 https://vercel.com
- 使用 GitHub 账号登录（推荐）

### 2. 安装 Vercel CLI（本地部署时使用）
```bash
npm install -g vercel
```

### 3. 登录 Vercel
```bash
vercel login
```
按提示完成浏览器授权登录。

## 部署步骤

### 方式一：通过 GitHub 自动部署（推荐）

1. 在 GitHub 上创建一个新仓库
2. 将本地代码推送到 GitHub：
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

3. 在 Vercel 控制台：
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 框架预设选择 "Next.js"
   - 点击 "Deploy"

### 方式二：通过 Vercel CLI 直接部署

```bash
cd personal-blog
vercel --prod
```

按提示选择或创建项目，然后自动部署。

## 环境变量配置

部署后需要在 Vercel 控制台设置环境变量：

1. 进入项目设置 → Environment Variables
2. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `file:./prisma/dev.db` |
| `NEXTAUTH_SECRET` | `your-secret-key-here` （随机字符串，用于加密） |
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` |

### 生成随机密钥
```bash
openssl rand -base64 32
```

## 数据库说明

当前使用 SQLite 数据库（`prisma/dev.db`），文件存储在项目目录中。

**注意**：Vercel 是无状态服务器，SQLite 文件在每次部署后会被重置。

### 解决方案（推荐迁移到 PostgreSQL）：

1. 在 Vercel 控制台添加 PostgreSQL 数据库（Vercel Postgres）
2. 或使用 Neon、Supabase 等免费 PostgreSQL 服务
3. 修改 `prisma/schema.prisma`：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
4. 更新环境变量 `DATABASE_URL` 为 PostgreSQL 连接字符串

## 部署后访问

部署成功后，Vercel 会提供一个默认域名：
`https://你的项目名.vercel.app`

你可以在 Vercel 控制台设置自定义域名。

## 功能验证清单

部署后请验证以下功能：
- [ ] 首页正常显示（动漫背景、日期、每日一言、报纸卡片）
- [ ] 文章列表页正常
- [ ] 文章详情页正常（点击卡片可进入）
- [ ] 访客评论功能（无需登录）
- [ ] 用户注册/登录
- [ ] 分类和标签页面
- [ ] 阅读吧页面（经典文章）
- [ ] 草稿箱和收藏页面（需登录）
- [ ] 点赞和收藏功能
