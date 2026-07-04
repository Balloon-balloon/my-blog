# 十大傻博客 - 部署指南（Railway + PostgreSQL）

本指南将帮助你将博客部署到 Railway 平台。

## 前提条件

1. 一个 [Railway](https://railway.app) 账号（支持邮箱注册）
2. 你的代码已推送到 GitHub 仓库
3. 已配置好的 Neon PostgreSQL 数据库（已有）

## 部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "准备部署 Railway"
git push
```

### 2. 在 Railway 创建项目

1. 打开 [railway.app](https://railway.app) → 点右上角 **Sign Up** → **Continue with Email**（用邮箱注册，绕开 GitHub 授权问题）
2. 登录后点 **New Project** → **Deploy from GitHub repo**
3. 授权 Railway 访问你的 GitHub 仓库，选择 `personal-blog`
4. Railway 会自动检测 Next.js 并开始部署

### 3. 配置环境变量

在 Railway Dashboard 中，进入你的项目 → **Variables**，添加以下变量：

| 变量名 | 值 |
|---|---|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_pokacN9vU4lI@ep-withered-night-aolhm8px.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`（你的 Neon 连接串） |
| `NEXTAUTH_SECRET` | `ZPBR29uKTiAmEqYsChwpErZO5VR8t3+ZK9Jis9tM790=`（你的密钥） |
| `NEXTAUTH_URL` | 部署后 Railway 会分配域名，先填 `https://你的项目名.up.railway.app`，部署后可以从 Settings 里看到 |

> **提示**：`NEXTAUTH_URL` 可以在部署完成后更新为 Railway 分配的实际域名。

### 4. 运行数据库迁移

部署完成后，在 Railway Dashboard 进入项目 → **Shell** 标签，执行：

```bash
npx prisma db push
```

这会根据 Prisma Schema 在你的 Neon 数据库中创建所有表。

### 5. 部署成功

部署成功后，Railway 会分配一个 `*.up.railway.app` 域名，可以直接访问你的博客。

## 其他信息

- **构建命令**：已配置在 `railway.json` 中，会自动执行 `npx prisma generate && next build`
- **启动命令**：`next start`
- **国内访问**：如果速度慢，可以在 Railway 的 Settings 中绑定自定义域名
