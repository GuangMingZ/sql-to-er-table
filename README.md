# 全栈 Web 应用框架

这是一个基于 **Express + React + Vite** 的前后端融合架构示例项目,展示了现代全栈 Web 应用的最佳实践。

## 架构特点

### 🏗️ 前后端融合
- **单一代码仓库**：前端和后端代码在同一个项目中,便于统一管理
- **统一构建流程**：使用 Vite 同时支持开发和生产环境
- **类型共享**：前后端共享 TypeScript 类型定义

### 🚀 技术栈

#### 前端
- **React 18**: 现代化的 UI 框架
- **TypeScript**: 完整的类型支持
- **Vite**: 快速的开发构建工具
- **React Router**: 客户端路由
- **Less**: CSS 预处理器

#### 后端
- **Express**: 轻量级 Node.js Web 框架
- **TypeScript**: 类型安全的服务端开发
- **Winston**: 日志管理
- **Express-async-errors**: 异步错误处理

## 项目结构

```
.
├── client/                 # 前端代码
│   ├── pages/             # 页面组件
│   ├── components/        # 可复用组件
│   ├── hooks/             # React Hooks
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 根组件
│   └── main.tsx           # 前端入口
│
├── server/                 # 后端代码
│   ├── middleware/        # Express 中间件
│   ├── utils/             # 工具函数
│   └── server.ts          # 服务端入口
│
├── assets/                 # 静态资源
├── package.json           # 项目配置
└── tsconfig.json          # TypeScript 配置
```

## 快速开始

### 环境要求

- Node.js 20+
- npm 10+

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目启动后,在浏览器中访问 `http://127.0.0.1:3003`

### 构建生产版本

```bash
# 构建前端
npm run build:client

# 启动生产服务器
npm start
```

## 核心功能

### 1. 开发环境热更新
- 前端使用 Vite HMR 实现快速热更新
- 后端使用 tsx watch 实现自动重启

### 2. 统一的中间件系统
- HTTP 日志记录
- 错误处理
- 静态资源服务
- API 路由

### 3. 类型安全
- 前后端共享类型定义
- 完整的 TypeScript 支持

### 4. 生产环境优化
- Vite 构建优化
- 静态资源压缩
- 按需加载

## 配置说明

### 环境变量

在项目根目录创建 `.env` 文件:

```env
# 服务端口
PORT=3003

# 环境标识
IS_ONLINE=false
IS_DEBUG=false
```

### TypeScript 配置

项目使用 `tsconfig.json` 统一配置前后端的 TypeScript 编译选项:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true
  }
}
```

## 扩展开发

### 添加新的 API 路由

在 `server/middleware/serveApi.ts` 中添加新的路由:

```typescript
router.get("/your-api", (req, res) => {
  res.json({ message: "Your response" });
});
```

### 添加新的页面

1. 在 `client/pages/` 目录下创建新的页面组件
2. 在 `client/App.tsx` 中添加路由配置

```typescript
<Route path="/your-page" element={<YourPage />} />
```

### 添加中间件

在 `server/middleware/` 目录下创建新的中间件文件,然后在 `server/server.ts` 中注册。

## 最佳实践

1. **代码组织**: 按功能模块组织代码,保持清晰的目录结构
2. **类型定义**: 将共享的类型定义放在 `types/` 目录下
3. **错误处理**: 使用统一的错误处理中间件
4. **日志记录**: 使用 Winston 进行结构化日志记录
5. **环境配置**: 使用环境变量管理不同环境的配置

## License

ISC
