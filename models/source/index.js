/*
 * index.js
 */

const path = require('path')
const config = require('../../config')

module.exports = require(path.join(__dirname, config.source.type))
