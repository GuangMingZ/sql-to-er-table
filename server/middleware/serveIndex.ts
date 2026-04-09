import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";

const STATIC_INDEX = fileURLToPath(
  new URL("../../client/dist/index.html", import.meta.url)
);

export const serveIndex: () => express.RequestHandler[] = () => [
  cookieParser(),
  async (req, res) => {
    if (req.method !== "GET") {
      res.status(400).send("Unsupported request method");
      return;
    }

    const html = await fs.promises.readFile(STATIC_INDEX, {
      encoding: "utf-8",
    });

    res.status(200);

    // 返回HTML
    res.contentType("html").send(html);

    return;
  },
];
