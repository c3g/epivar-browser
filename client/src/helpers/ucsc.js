import {queryStringFromEntries as qs} from "./queryString";

export const constructUCSCUrl = params =>
  `https://genome.ucsc.edu/cgi-bin/hgTracks?${qs(params)}`;
