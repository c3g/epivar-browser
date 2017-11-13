/*
 * db.js
 */

const fs = require('fs')
const { promisify } = require('util')
const sqlite3 = require('sqlite3')
const config = require('./config.js')

const db = new sqlite3.Database(config.paths.db)

db.get(`SELECT name FROM main.sqlite_master WHERE type='table'`, (err, row) => {
  if (!row)
    db.run(`CREATE TABLE sessions (
      hash    varchar(32) not null,
      samples text        not null,
      chrom   varchar(5)  not null,
      start   integer     not null,
      end     integer     null
    )`)
})


const toPromise = which =>
  (...args) =>
    new Promise((resolve, reject) =>
      db[which].apply(db, args.concat((err, res) => err ? reject(err) : resolve(res))))

module.exports = {
  get: toPromise('get'),
  all: toPromise('all'),
  run: toPromise('run'),
}
