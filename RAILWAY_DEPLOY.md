# 10大帝博客 - Railway 部署指南

## 1. 注册 Railway 账号

- 访问 https://railway.app
- 用 GitHub 账号登录（推荐）

## 2. 创建 PostgreSQL 数据库

1. 登录 Railway 后，点击 **New Project**
2. 选择 **Provision PostgreSQL**
3. 记住数据库连接信息（后面需要）

## 3. 导入 GitHub 仓库

1. 在项目页面，点击 **New** → **GitHub Repo**
2. 选择你的仓库 `Balloon-balloon/my-blog`
3. Railway 会自动识别为 Next.js 项目

## 4. 设置环境变量

进入项目 **Variables** 标签，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | Railway 自动提供 | PostgreSQL 连接字符串 |
| `NEXTAUTH_SECRET` | 随机字符串 | 用于加密，生成长度 32 位的随机字符串 |
| `NEXTAUTH_URL` | Railway 提供的域名 | 部署后 Railway 会给一个域名，如 `https://xxx.up.railway.app` |
| `NODE_ENV` | `production` | 生产环境 |

**生成 NEXTAUTH_SECRET**：
```bash
openssl rand -base64 32
```

## 5. 部署

1. 点击 **Deploy** 按钮
2. Railway 会自动构建并部署
3. 等待构建完成（约 2-3 分钟）

## 6. 获取访问地址

部署成功后：
1. 进入项目的 **Settings** → **Networking**
2. 开启 **Public Networking**，Railway 会分配一个域名
3. 把这个域名填到 `NEXTAUTH_URL` 环境变量里
4. 重新部署一次

## 7. 验证功能

- [ ] 首页正常显示
- [ ] 文章列表和详情页正常
- [ ] 访客可以浏览所有文章
- [ ] 访客可以评论（无需登录）
- [ ] 用户可以注册/登录
- [ ] 登录后可以点赞、收藏、写文章
- [ ] 阅读吧页面正常

## 注意事项

- Railway 免费额度：每月 5 美元，足够个人博客使用
- 数据库已经自动迁移，无需手动操作
- 如果需要自定义域名，可以在 Railway 的 **Settings** → **Domains** 里配置
