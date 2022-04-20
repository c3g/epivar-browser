/*
 * consents.js
 */

import db from "./db.mjs";

export const getTermsConsent = async (issuer, sub, version) => {
  if (!issuer || !sub || !version) return false;

  const params = [issuer, sub, parseInt(version, 10)];
  const res = await db.findOne(
    `SELECT * FROM term_consents WHERE "issuer" = $1 AND "sub" = $2 AND "version" = $3`,
    params);

  if (!res) {
    await db.insert(
      `
      INSERT INTO term_consents ("issuer", "sub", "version", "consent")
      VALUES ($1, $2, $3, false)
      ON CONFLICT ON CONSTRAINT term_consents_issuer_sub_key DO
        UPDATE SET version = $3, consent = false
      `,
      params);
    return false;
  }

  return res.consent;
};

export const setTermsConsent = (issuer, sub, version, consent) => {
  const params = [issuer, sub, parseInt(version), Boolean(consent)];
  return db.insert(
    `
    INSERT INTO term_consents ("issuer", "sub", "version", "consent")
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ON CONSTRAINT term_consents_issuer_sub_key DO
        UPDATE SET version = $3, consent = $4
    `,
    params);
}

export default {
  getTermsConsent,
  setTermsConsent,
};
