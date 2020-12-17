/*
 * sessions.sql
 * Copyright (C) 2020 romgrk <romgrk@arch>
 *
 * Distributed under terms of the MIT license.
 */

CREATE TABLE sessions (
  hash     varchar(32) primary key,
  samples  text        not null,
  peak     text        not null
);


-- vim:et
