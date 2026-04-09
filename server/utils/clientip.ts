import net from "net";

export const getClientIp = (request: any) => {
  let remoteIp = request.get("x-ecdn-real-ip") || request.get("x-real-ip");
  if (!remoteIp) {
    remoteIp = request.get("x-forwarded-for");
  }
  if (!remoteIp) {
    remoteIp = request.ip || request.connection.remoteAddress;
  }
  if (!remoteIp) {
    remoteIp = "127.0.0.1";
  }
  // 如果取到x-forwarded-for，则有可能会是多个ip串，这种情况下取最左侧第一个
  if (remoteIp.indexOf(",") != -1) {
    remoteIp = remoteIp.split(",").shift();
  }

  // IPv6 地址跳过
  if (net.isIPv6(remoteIp)) {
    return remoteIp;
  } else {
    return remoteIp.split(":").shift() || request.ip || "127.0.0.1";
  }
};
