/*
 * peaks.sql
 * Copyright (C) 2020 romgrk <romgrk@arch>
 *
 * Distributed under terms of the MIT license.
 */

create table peaks (
    id        integer primary key autoincrement,
    rsID      text,
    chrom     text,
    position  integer,
    gene      text,
    feature   text not null, -- chrom_start_end
    valueNI   double,
    valueFlu  double,
    assay     text
);

create index rsID_idx 
    on peaks(rsID);

