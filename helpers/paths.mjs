import {NODE_BASE_URL} from "../envConfig.js";

export const buildApiPath = (path) => `${NODE_BASE_URL}/api${path}`;
