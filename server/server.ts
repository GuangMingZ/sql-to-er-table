import express from "express";
import "express-async-errors";
import "../env";
import { serveApi } from "./middleware/serveApi";
import { serveAssets } from "./middleware/serveAssets";
import { serveErrorHandler } from "./middleware/serveErrorHandler";
import { serveHttpLogger } from "./middleware/serveHttpLogger";
import { serveIndex } from "./middleware/serveIndex";
import { serveClientVite } from "./middleware/serveVite";
import { logger } from "./utils/logger";

const port = process.env.PORT || 14111;
const isTke = ["yes", "on", "true", "1"].includes(
  process.env.IS_ONLINE?.toLowerCase() ?? ""
);
const isDebug = ["yes", "on", "true", "1"].includes(
  process.env.IS_DEBUG?.toLowerCase() ?? ""
);

export async function startup() {
  const app = express();

  // HTTP 日志中间件（仅对 API 路由生效）
  app.use("/api", serveHttpLogger());

  // API 路由
  app.use("/api", serveApi());

  // 静态资源代理
  if (isTke) {
    app.use("/assets", serveAssets());
  }

  // 前端路由
  if (isTke || isDebug) {
    app.use(serveIndex());
  } else {
    app.use("/", await serveClientVite());
  }

  // 错误处理中间件（必须放在所有路由之后）
  app.use(serveErrorHandler());

  app.listen(port);

  logger.info({
    event: "startup",
    message: `Server listening at http://127.0.0.1:${port}`,
  });
}

startup();
