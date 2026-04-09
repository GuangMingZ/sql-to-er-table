import "dotenv/config";

export const { NODE_ENV, PORT, DATA_DIR } = process.env;

export const DEV = NODE_ENV === "development";

export const LOCAL = NODE_ENV === "local";

for (const [key, value] of Object.entries({
  NODE_ENV,
  DATA_DIR,
})) {
  if (!value) {
    throw new Error(`请设置 ${key} 环境变量`);
  }
}
