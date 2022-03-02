const {createClient} = require("redis");

const redisClient = createClient();

redisClient.on("error", err => console.error("[redis]", err.toString()));

process.on("SIGTERM", async () => {
  if (redisClient.isOpen) {
    await redisClient.disconnect();
  }
});

const open = async () => {
  if (!redisClient.isOpen) await redisClient.connect();
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
  open,
  getJSON,
  setJSON,
};
