/*
 * consents.js
 */

const Database = require('sqlite-objects').Database
const fs = require("fs");
const path = require("path");

const config = require('../config')

const database = new Database(config.paths.consents);

const consentsSchema = fs.readFileSync(path.join(__dirname, "consents.sql"), "utf-8");
const initializeConsentTables = () => database.run(consentsSchema);

const getTermsConsent = async (issuer, sub, version) => {
  if (!issuer || !sub || !version) return false;

  const params = {issuer, sub, version};
  const res = await database.findOne(
    `SELECT * FROM term_consents WHERE issuer = @issuer AND sub = @sub AND version = @version`, params);

  if (!res) {
    await database.insert(
      "INSERT OR REPLACE INTO term_consents VALUES (@issuer, @sub, @version, 0)", params);
    return false;
  }

  return Boolean(res.consent);
};

const setTermsConsent = (issuer, sub, version, consent) => {
  return database.insert(
    "INSERT OR REPLACE INTO term_consents VALUES (@issuer, @sub, @version, @consent)",
    {issuer, sub, version, consent: consent ? 1 : 0})
}

module.exports = {
  initializeConsentTables,
  getTermsConsent,
  setTermsConsent,
};
