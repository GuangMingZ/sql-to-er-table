import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import path from "path";

const STATIC_DIR = path.join(process.cwd(), "/client/dist/");
const ASSETS_DIR = path.join(STATIC_DIR, "assets/");
const contentTypeMap: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export const serveAssets: () => express.RequestHandler[] = () => [
  cookieParser(),
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(400).send("Unsupported request method");
      return;
    }

    // 获取请求路径，排除查询参数
    const requestPath = `/assets${req.url}`;

    try {
      // 检查是否请求的是assets目录下的静态文件
      if (requestPath.startsWith("/assets/")) {
        // 构建完整的文件路径
        const filePath = path.join(STATIC_DIR, requestPath);

        // 验证文件是否在assets目录内（安全检查，防止目录遍历攻击）
        if (!filePath.startsWith(ASSETS_DIR)) {
          res.status(403).send("Access denied");
          return;
        }

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
          res.status(404).send("File not found");
          return;
        }

        // 获取文件扩展名以设置正确的Content-Type
        const ext = path.extname(filePath).toLowerCase();

        // 设置Content-Type
        res.contentType(contentTypeMap[ext] || "application/octet-stream");

        // 读取并发送文件
        const fileContent = await fs.promises.readFile(filePath);
        res.status(200).send(fileContent);
        return;
      } else {
        // 请求路径不以/assets/开头时的处理
        res.status(404).send("Resource not found");
        return;
      }
    } catch (error) {
      console.error("Error serving static file:", error);
      res.status(500).send("Internal server error");
      return;
    }
  },
];
