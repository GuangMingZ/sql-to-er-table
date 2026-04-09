import type { ErrorRequestHandler } from "express";
import { DEV } from "../../env";
import { logger } from "../utils/logger";

export const serveErrorHandler: () => ErrorRequestHandler = () => {
  return (err, req, res, _next) => {
    logger.error({
      event: "unhandled-error",
      message: err.message || "Internal Server Error",
      error: err,
      path: req.path,
      method: req.method,
    });

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      stack: DEV ? err?.stack : undefined,
    });
  };
};
