import reactPlugin from "@vitejs/plugin-react";
import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import tsconfigPaths from "vite-plugin-tsconfig-paths";

const BASE_PATHS = {
  FRONTEND: "/client/",
};

const URL_PATHS = {
  FRONTEND: "../../client/",
};

const DEV_HTML_PATHS = {
  FRONTEND: URL_PATHS.FRONTEND + "index-dev.html",
};

const PORT = {
  FRONTEND: 5176,
};

const createViteInstance = async (
  basePath: string,
  rootPath: string,
  port: number,
  cacheDir: string
) => {
  return await createViteServer({
    base: basePath,
    mode: "development",
    plugins: [reactPlugin(), tsconfigPaths()],
    root: fileURLToPath(new URL(rootPath, import.meta.url)),
    server: {
      middlewareMode: true,
      hmr: { protocol: "http", host: "127.0.0.1", port: port + 1 },
      allowedHosts: true,
      port,
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify("development"),
    },
    cacheDir,
    appType: "custom",
  });
};

export const serveClientVite = async () => {
  const frontendDevHTML = readFileSync(
    new URL(DEV_HTML_PATHS.FRONTEND, import.meta.url),
    "utf-8"
  );
  const frontendVite = await createViteInstance(
    BASE_PATHS.FRONTEND,
    URL_PATHS.FRONTEND,
    PORT.FRONTEND,
    "node_modules/.vite-frontend"
  );

  const serveFrontend: express.RequestHandler = (req, res) => {
    res.status(200).type("html").send(frontendDevHTML);
  };
  return [frontendVite.middlewares, serveFrontend];
};
