import express, { Router } from "express";

/**
 * 示例 API 路由
 */
export function serveApi() {
  const router = Router();
  router.use(express.json());

  // 示例 GET 接口
  router.get("/hello", (req, res) => {
    res.json({
      message: "Hello from Express API!",
      timestamp: new Date().toISOString(),
    });
  });

  // 示例 POST 接口
  router.post("/echo", (req, res) => {
    const { data } = req.body;
    res.json({
      echo: data,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
