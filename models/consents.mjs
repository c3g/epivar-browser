/*
 * consents.js
 */

import db from "./db.mjs";

export const getTermsConsent = async (ipAddress, version) => {
  if (!ipAddress || !version) return false;

  const params = [ipAddress, parseInt(version, 10)];
  const res = await db.findOne(
    `SELECT "consent" FROM term_consents_ip WHERE "ip_addr" = $1 AND "version" = $2`,
    params);

  if (!res) {
    await db.insert(
      `
      INSERT INTO term_consents_ip ("ip_addr", "version", "consent")
      VALUES ($1, $2, false)
      ON CONFLICT ON CONSTRAINT term_consents_ip_addr_key DO
        UPDATE SET version = $2, consent = false, ts = (now() at time zone 'utc')
      `,
      params);
    return false;
  }

  return res.consent;
};

export const setTermsConsent = (ipAddress, version, consent) => {
  const params = [ipAddress, parseInt(version), Boolean(consent)];
  return db.insert(
    `
    INSERT INTO term_consents ("ip_addr", "version", "consent")
    VALUES ($1, $2, $3)
    ON CONFLICT ON CONSTRAINT term_consents_ip_addr_key DO
        UPDATE SET "version" = $2, "consent" = $3
    `,
    params);
}

export default {
  getTermsConsent,
  setTermsConsent,
};
