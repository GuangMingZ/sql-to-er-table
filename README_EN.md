# SQL to ER Diagram

English | [简体中文](./README.md)

A web application that converts SQL DDL statements into visual ER diagrams, built with **Express + React + Vite** full-stack architecture.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

## ✨ Features

- 🔍 **SQL Parsing** - Parse `CREATE TABLE` statements, automatically extract table structure (columns, types, comments, primary keys, etc.)
- 🗺️ **ER Diagram Generation** - Generate interactive entity-relationship diagrams based on parsing results
- 🔗 **Relationship Detection** - Automatically identify foreign key constraints and draw relationship lines between tables
- 🖱️ **Interactive Operations** - Support drag, zoom, minimap navigation, node expand/collapse
- 📐 **Auto Layout** - Use Dagre algorithm to automatically arrange table node positions
- 🔒 **Secure Transmission** - SQL transmitted with AES-256-GCM encryption
- 🗄️ **Multi-Database Support** - Support 11 database dialects including MySQL, PostgreSQL, SQLite, MariaDB, etc.

### Supported Database Types

| Database | Status |
|----------|--------|
| MySQL | ✅ Default |
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

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Ant Design** - UI component library
- **React Flow** - Graph visualization engine
- **Dagre** - Graph layout algorithm
- **Less** - CSS preprocessor

### Backend
- **Express** - Node.js web framework
- **node-sql-parser** - SQL parser
- **Winston** - Logging system
- **AES-256-GCM** - Data encryption

## 📁 Project Structure

```
sql-to-er-table/
├── client/                          # Frontend code
│   ├── pages/SqlToER/              # SQL to ER page
│   ├── components/ERDiagram/       # ER diagram components
│   │   ├── ERDiagram.tsx           # Main container (React Flow)
│   │   ├── ERNode.tsx              # Table node renderer
│   │   ├── ERDiagramParser.ts      # Graph data parser
│   │   └── utils.ts                # Layout algorithm
│   ├── utils/
│   │   ├── sqlParser.ts            # API call wrapper
│   │   └── crypto.ts               # Client-side encryption
│   ├── App.tsx                     # Root component
│   └── main.tsx                    # Frontend entry
│
├── server/                          # Backend code
│   ├── services/
│   │   └── sqlParser.ts            # SQL parsing service
│   ├── middleware/
│   │   └── serveApi.ts             # API routes
│   └── server.ts                   # Server entry
│
├── shared/                          # Shared between frontend & backend
│   ├── types.ts                    # Type definitions
│   └── crypto.ts                   # Encryption utilities
│
└── package.json
```

## 🚀 Quick Start

### Requirements

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd sql-to-er-table

# Install dependencies
npm install
```

### Development Mode

```bash
npm run dev
```

Visit http://127.0.0.1:3003

### Production Build

```bash
# Build frontend
npm run build:client

# Start server
npm start
```

## 📖 Usage

1. Paste SQL DDL statements (`CREATE TABLE` statements) in the input box
2. Select the corresponding database type (default: MySQL)
3. Click the "Generate ER Diagram" button
4. View the generated ER diagram with support for:
   - Mouse drag to move canvas
   - Scroll wheel to zoom
   - Click nodes to view details
   - Use minimap for quick navigation

### Example SQL

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'User ID',
  username VARCHAR(50) NOT NULL COMMENT 'Username',
  email VARCHAR(100) COMMENT 'Email',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) COMMENT='Users table';

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT 'User ID',
  amount DECIMAL(10,2) COMMENT 'Order amount',
  FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='Orders table';
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Server port
PORT=3003

# Encryption key (must be changed in production)
SQL_ENCRYPTION_KEY=your-custom-encryption-key-32byte!
```

## 🔒 Security

- SQL statements are encrypted with **AES-256-GCM** before transmission to the server
- The encryption algorithm includes an authentication tag (AuthTag) to prevent data tampering
- Always configure a custom encryption key in production environments

## 📜 API Reference

### POST /api/parse-sql

Parse encrypted SQL DDL statements.

**Request Parameters:**

```json
{
  "payload": "encrypted SQL string",
  "database": "MySQL"
}
```

**Response:**

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
