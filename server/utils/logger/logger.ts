import winston, { format } from "winston";
import "winston-daily-rotate-file";

const rotateOptions: { maxFiles?: number | string; maxSize?: number | string } =
  {};

if (process.env.POD_IP) {
  rotateOptions.maxFiles = 7;
  rotateOptions.maxSize = 1.5 * 1024 * 1024 * 1024;
}

const level = process.env.LOG_LEVEL || "info";
const dirname = process.env.POD_IP
  ? process.env.LOG_DIRNAME || "/data/sql-to-er-table_logs"
  : "./.data";
const logPrefix = process.env.LOG_PREFIX || "sql-to-er-table_winston_";

/** 获取当前任务 ID（Agent 剥离后始终返回 undefined） */
function tryGetCurrentTaskId(): string | undefined {
  return undefined;
}

const handleObjectMessageFormat = format((info) => {
  if (typeof info.message === "object" && info.message !== null) {
    Object.assign(info, info.message);
    delete info.message;
  }

  info.level = info.level.toUpperCase();

  if (!info.taskId) {
    info.taskId = tryGetCurrentTaskId();
  }
  return info;
});

const createLogger = () =>
  winston.createLogger({
    format: format.combine(
      handleObjectMessageFormat(),
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      format.printf((info) => `${JSON.stringify(info)}`)
    ),
    transports: [
      new winston.transports.DailyRotateFile({
        level,
        json: false,
        // 日志打印目录
        dirname,
        datePattern: "YYYYMMDDHH",
        filename: `${logPrefix}%DATE%`,
        extension: ".log",
        ...rotateOptions,
      }),
      new winston.transports.Console(),
    ],
  });

const rawLogger = createLogger();

interface LogContent {
  /** 事件类型，必传 */
  event: string;

  /** 消息内容，尽量提供日志关键信息 */
  message: string;

  /** 事件发生的堆栈，对于异常最好提供 stack */
  stack?: string;

  /** 事件相关数据 */
  data?: any;

  /** 其他日志信息 */
  [key: string]: any;
}

interface Logger {
  error: LogMethod;
  warn: LogMethod;
  info: LogMethod;
  debug: LogMethod;
  verbose: LogMethod;
}
type LogMethod = (log: LogContent) => void;

const logLevels = ["error", "warn", "info", "debug", "verbose"] as const;
export const logger = logLevels.reduce(
  (logger, level) => ({
    ...logger,
    [level]: (log: LogContent) => rawLogger[level](log),
  }),
  Object.create(null) as Logger
);
