import fs from "fs";

import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.VARWIG_PG_CONNECTION ?? undefined,
});

export const ready = new Promise((resolve, reject) => {
  // Schema should be set up with '... IF NOT EXISTS' statements, so we can
  // always execute it on startup/import
  fs.readFile(
    new URL("schema.sql", import.meta.url),  // ESM way  of resolving schema file
    {encoding: "utf-8"},
    (err, data) => {
      if (err) {
        console.error(err);
        reject();
        process.exit(1);
      }

      pool.query(data).then(() => resolve());
    });
});
await ready;

export const connect = () => pool.connect();

export const run = query => pool.query(query);

export const findOne = async (query, params) => {
  const res = await pool.query(query, params);
  return res.rowCount ? res.rows[0] : null;
};

export const findAll = async (query, params) => (await pool.query(query, params)).rows;

export const runWithTransaction = async (...args) => {
  // Use same client for whole transaction
  const client = await pool.connect()

  let res = null;

  try {
    await client.query("BEGIN");
    res = await client.query(...args);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }

  return res;
}

export const insert = (query, row) => runWithTransaction(query, row);  // for argument typing

export const insertMany = async (query, rows) => {
  // Use same client for whole transaction
  const client = await pool.connect()

  try {
    await client.query("BEGIN");
    for (let row of rows) {
      await client.query(query, row);
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export default {
  ready,
  connect,
  run,
  findOne,
  findAll,
  insert,
  insertMany,
};
