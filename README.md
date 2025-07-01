# 互动媒体展示平台 - 前端

这是互动媒体展示平台的前端项目，基于 React + TypeScript + Vite 构建。

## 功能特性

- 📱 **响应式设计** - 完美适配移动端和桌面端
- 🎨 **现代化 UI** - 使用 Tailwind CSS 构建美观界面
- 🖼️ **媒体展示** - 支持图片、视频、音频的展示和播放
- 💬 **实时聊天** - 用户可以实时交流互动
- 👤 **用户管理** - 简单的用户注册和管理
- 🔧 **管理后台** - 完整的管理员功能
- 🎯 **自动播放** - 媒体内容自动轮播功能

## 技术栈

- **React 18** - 用户界面框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **React Router** - 客户端路由
- **Lucide React** - 现代化图标库

## 开发模式

项目支持两种开发模式：

### 1. Mock API 模式 (默认)
使用本地模拟数据，无需后端服务器：
```bash
npm run dev
```

### 2. 真实 API 模式
连接到后端 API 服务器：
```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:3001/api/v1

# 启动开发服务器
npm run dev
```

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 项目结构

```
src/
├── components/          # React 组件
│   ├── admin/          # 管理员相关组件
│   ├── MediaDisplay.tsx
│   ├── ChatPanel.tsx
│   └── ...
├── hooks/              # 自定义 React Hooks
├── services/           # API 服务和 Mock 数据
├── types/              # TypeScript 类型定义
└── App.tsx            # 主应用组件
```

## 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 地址 | `http://localhost:3001/api/v1` |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` |
| `VITE_SUPABASE_URL` | Supabase 项目 URL | - |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 | - |

## 路由说明

- `/` - 主页面 (默认演示页面)
- `/page/:pageId` - 特定媒体页面
- `/admin` - 管理员登录/仪表板
- `/admin/login` - 管理员登录页面
- `/admin/dashboard` - 管理员仪表板

## 管理员账户

开发模式下的默认管理员账户：
- 用户名: `superadmin`
- 密码: `admin123`

## 部署

### 构建生产版本
```bash
npm run build
```

### 部署到静态托管
构建完成后，`dist` 目录包含所有静态文件，可以部署到：
- Netlify
- Vercel
- 阿里云 OSS
- 腾讯云 COS
- 或任何静态文件托管服务

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 开发指南

### 添加新组件
1. 在 `src/components/` 目录下创建组件文件
2. 使用 TypeScript 和 Tailwind CSS
3. 导出组件并在需要的地方导入

### 添加新页面
1. 在 `src/components/` 下创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 更新类型定义（如需要）

### API 集成
1. 在 `src/services/api.ts` 中添加 API 方法
2. 在 `src/services/mockData.ts` 中添加对应的 Mock 方法
3. 在组件中使用 hooks 调用 API

## 注意事项

- 项目使用 TypeScript，请保持类型安全
- 所有组件都应该是响应式的
- 使用 Tailwind CSS 类名而不是自定义 CSS
- Mock API 模式下数据不会持久化
- 生产环境请确保正确配置环境变量

## 许可证

MIT License