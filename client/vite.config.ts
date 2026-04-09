import path from "path";
import { defineConfig } from "vite";
import crypto from "crypto";

const base = "/";

export default defineConfig(() => {
  return {
    base: base,
    build: {
      cssCodeSplit: false,
      sourcemap: true,
      rollupOptions: {
        output: {
          // 使用自定义函数生成十六进制 hash（符合 CDN 校验规则 \w，不包含 - 和 _）
          entryFileNames: (chunkInfo) => {
            const name = chunkInfo.name || "entry";
            // 使用 facadeModuleId 生成稳定的 hash
            const source = chunkInfo.facadeModuleId || name;
            const hash = crypto
              .createHash("md5")
              .update(source)
              .digest("hex")
              .substring(0, 8);

            return `assets/${name}.${hash}.js`;
          },
          chunkFileNames: (chunkInfo) => {
            const name = chunkInfo.name || "chunk";
            // 对于 chunk，使用 moduleIds 组合生成 hash
            const source = chunkInfo.moduleIds.join(",") || name;
            const hash = crypto
              .createHash("md5")
              .update(source)
              .digest("hex")
              .substring(0, 8);

            return `assets/${name}.${hash}.js`;
          },
          // 使用自定义函数生成十六进制 hash（符合 CDN 校验规则 \w）
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || "asset";
            const extname = path.extname(name);
            const basename = path.basename(name, extname);

            // 从 source 获取文件内容并生成十六进制 hash
            const source = assetInfo.source;
            const hash = crypto
              .createHash("md5")
              .update(source as string | Buffer)
              .digest("hex")
              .substring(0, 8); // 取前 8 位，满足 CDN 校验规则

            return `assets/${basename}.${hash}${extname}`;
          },
        },
      },
    },
    optimizeDeps: {
      include: [],
      exclude: [],
    },
    resolve: {
      alias: {
        "@client": path.resolve(__dirname, "./"),
        "@assets": path.resolve(__dirname, "../assets"),
      },
    },
    server: {
      port: 5173,
      host: "0.0.0.0",
      allowedHosts: [],
      watch: {
        // 忽略 client 目录之外的所有文件变更
        ignored: ["!**/client/**", "**/server/**", "**/node_modules/**"],
      },
    },
    plugins: [],
  };
});
