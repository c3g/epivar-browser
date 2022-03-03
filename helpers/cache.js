const {createClient} = require("redis");

const redisClient = createClient();

redisClient.on("error", err => console.error("[redis]", err.toString()));

const open = async () => {
  if (!redisClient.isOpen) await redisClient.connect();
};

const close = async () => {
  if (redisClient.isOpen) await redisClient.disconnect();
}

const _cleanup = async () => {
  await close();
};

process.on("SIGTERM", _cleanup);
process.on("exit", _cleanup);

const NAMESPACE = "varwig";
const ns = k => `${NAMESPACE}:${k}`;

const clear = async () => {
  // noinspection JSCheckFunctionSignatures
  const keys = await redisClient.keys(ns("*"));
  console.log(`    found ${keys.length} cache entries`);
  if (keys.length) {
    // noinspection JSCheckFunctionSignatures
    await redisClient.del(keys);
  }
};

const getJSON = async k => {
  const r = await redisClient.get(k);
  return r ? JSON.parse(r) : r;
};

// noinspection JSCheckFunctionSignatures
const setJSON = async (k, v, e) =>
  await redisClient.set(k, JSON.stringify(v), {
    EX: e || undefined
  });

module.exports = {
  redisClient,
  NAMESPACE,
  ns,
  open,
  close,
  clear,
  getJSON,
  setJSON,
};
