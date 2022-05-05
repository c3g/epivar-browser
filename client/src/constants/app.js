/*
 * app.js
 */

export const BASE_URL = `${window.location.origin}${process.env.PUBLIC_URL || ''}`;
export const LOGIN_PATH = "/api/auth/login";

export const ASSEMBLY = "hg19";

export const ETHNICITY_COLOR = {
  AF: '#5100FF',
  EU: '#FF8A00',
};

export const ETHNICITY_BOX_COLOR = {
  AF: 'rgba(81, 0, 255, 0.6)',
  EU: 'rgba(255, 138, 0, 0.6)',
};
