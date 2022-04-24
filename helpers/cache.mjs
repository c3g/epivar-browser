import {createClient} from "redis";

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

// noinspection JSCheckFunctionSignatures
export const has = k => redisClient.exists(ns(k));

export const getJSON = async k => {
  // noinspection JSCheckFunctionSignatures
  const r = await redisClient.get(ns(k));
  return r ? JSON.parse(r) : r;
};

// noinspection JSCheckFunctionSignatures
export const setJSON = async (k, v, e) =>
  await redisClient.set(ns(k), JSON.stringify(v), {
    EX: e || undefined
  });

export default {
  redisClient,
  NAMESPACE,
  ns,
  open,
  close,
  clear,
  has,
  getJSON,
  setJSON,
};
