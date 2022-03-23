/*
 * consents.sql
 * Copyright (C) 2022 McGill University
 */

create table if not exists term_consents (
    issuer  text not null,
    sub     text not null,  -- subject - user ID within the issuer
    version integer not null check (version > 0),
    -- boolean: has the user consented to this version of the terms:
    consent integer not null check (consent in (0, 1)),

    UNIQUE(issuer, sub)
);
