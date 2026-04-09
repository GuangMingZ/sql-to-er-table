# SQL to ER Diagram

[English](./README_EN.md) | 简体中文

一个将 SQL DDL 语句转换为可视化 ER 图的 Web 应用，基于 **Express + React + Vite** 全栈架构构建。

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

## ✨ 功能特性

- 🔍 **SQL 解析** - 支持解析 `CREATE TABLE` 语句，自动提取表结构（列名、类型、注释、主键等）
- 🗺️ **ER 图生成** - 基于解析结果生成交互式实体关系图
- 🔗 **关系识别** - 自动识别外键约束，绘制表之间的关联连线
- 🖱️ **交互操作** - 支持拖拽、缩放、小地图导航、节点展开/折叠
- 📐 **自动布局** - 使用 Dagre 算法自动排列表节点位置
- 🔒 **安全传输** - SQL 使用 AES-256-GCM 加密传输
- 🗄️ **多数据库支持** - 支持 MySQL、PostgreSQL、SQLite、MariaDB 等 11 种数据库方言

### 支持的数据库类型

| 数据库 | 状态 |
|--------|------|
| MySQL | ✅ 默认 |
| MariaDB | ✅ |
| PostgreSQL | ✅ |
| SQLite | ✅ |
| SQL Server (TransactSQL) | ✅ |
| Oracle (DB2) | ✅ |
| Hive | ✅ |
| BigQuery | ✅ |
| Athena | ✅ |
| Redshift | ✅ |
| FlinkSQL | ✅ |

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化 UI 框架
- **TypeScript** - 类型安全
- **Vite** - 快速构建工具
- **Ant Design** - UI 组件库
- **React Flow** - 图可视化引擎
- **Dagre** - 图布局算法
- **Less** - CSS 预处理器

### 后端
- **Express** - Node.js Web 框架
- **node-sql-parser** - SQL 解析器
- **Winston** - 日志系统
- **AES-256-GCM** - 数据加密

## 📁 项目结构

```
sql-to-er-table/
├── client/                          # 前端代码
│   ├── pages/SqlToER/              # SQL 转 ER 图页面
│   ├── components/ERDiagram/       # ER 图组件
│   │   ├── ERDiagram.tsx           # 主容器 (React Flow)
│   │   ├── ERNode.tsx              # 表节点渲染
│   │   ├── ERDiagramParser.ts      # 图数据解析器
│   │   └── utils.ts                # 布局算法
│   ├── utils/
│   │   ├── sqlParser.ts            # API 调用封装
│   │   └── crypto.ts               # 客户端加密
│   ├── App.tsx                     # 根组件
│   └── main.tsx                    # 前端入口
│
├── server/                          # 后端代码
│   ├── services/
│   │   └── sqlParser.ts            # SQL 解析服务
│   ├── middleware/
│   │   └── serveApi.ts             # API 路由
│   └── server.ts                   # 服务端入口
│
├── shared/                          # 前后端共享
│   ├── types.ts                    # 类型定义
│   └── crypto.ts                   # 加密工具
│
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- npm 10+

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd sql-to-er-table

# 安装依赖
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://127.0.0.1:3003

### 生产构建

```bash
# 构建前端
npm run build:client

# 启动服务
npm start
```

## 📖 使用说明

1. 在输入框中粘贴 SQL DDL 语句（`CREATE TABLE` 语句）
2. 选择对应的数据库类型（默认 MySQL）
3. 点击「生成 ER 图」按钮
4. 查看生成的 ER 图，支持：
   - 鼠标拖拽移动画布
   - 滚轮缩放
   - 点击节点查看详情
   - 使用小地图快速导航

### 示例 SQL

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(50) NOT NULL COMMENT '用户名',
  email VARCHAR(100) COMMENT '邮箱',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='用户表';

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  amount DECIMAL(10,2) COMMENT '订单金额',
  FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='订单表';
```

## ⚙️ 配置

### 环境变量

在项目根目录创建 `.env` 文件：

```env
# 服务端口
PORT=3003

# 加密密钥（生产环境必须修改）
SQL_ENCRYPTION_KEY=your-custom-encryption-key-32byte!
```

## 🔒 安全说明

- SQL 语句通过 **AES-256-GCM** 加密后传输至服务端
- 加密算法自带认证标签（AuthTag），防止数据篡改
- 生产环境请务必配置自定义加密密钥

## 📜 API 接口

### POST /api/parse-sql

解析加密的 SQL DDL 语句。

**请求参数：**

```json
{
  "payload": "加密后的SQL字符串",
  "database": "MySQL"
}
```

**响应：**

```json
{
  "success": true,
  "data": {
    "tables": [...],
    "relationships": {
      "relationships": [
        ["orders.user_id", "users.id"]
      ]
    }
  },
  "errors": []
}
```

## 📄 License

[ISC](./LICENSE)
