/*
 * db-ihec.js
 */


const mysql   = require('mysql')

const config = require('./config')

const pool = mysql.createPool({
  host:            config.mysql.host,
  user:            config.mysql.user,
  password:        config.mysql.password,
  database:        config.mysql.database,
  connectionLimit: 10,
})

function format(q, values = {}) {
  if (!values)
    return q

  return q.replace(/@(\w+)/g, (txt, key) => {
    if (key in values)
      return mysql.escape(values[key])
    return txt;
  })
}

function query(q, values) {
  return new Promise((resolve, reject) => {
    pool.query(format(q, values), (error, results, fields) => {
      if (error)
        reject(error)
      else
        resolve(results, fields)
    })
  })
}

function queryOne(q, values) {
  return query(q, values).then(results => results[0])
}

function insert(q, values) {
  return query(q, values).then(results => results.insertId)
}

function get() {
  return pool
}

module.exports = { get, query, queryOne, insert, escape: mysql.escape }
