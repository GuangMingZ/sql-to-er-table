export const getHrtimeMicrosecond = (nanoSecond: bigint) =>
  Math.round(Number((process.hrtime.bigint() - nanoSecond) / BigInt(1e3)));

export const getHrtimeMillisecond = (nanoSecond: bigint) =>
  Math.round(Number((process.hrtime.bigint() - nanoSecond) / BigInt(1e6)));
