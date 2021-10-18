/*
 * peaks.sql
 * Copyright (C) 2020 romgrk <romgrk@arch>
 *
 * Distributed under terms of the MIT license.
 */

create table peaks (
    id        integer primary key,
    rsID      text,
    chrom     text    not null,
    position  integer not null,
    gene      text,
    feature   text    not null, -- chrom_start_end
    valueNI   double  not null,
    valueFlu  double  not null,
    valueAvg  double  not null,  -- for prioritizing items in search
    assay     text    not null
);

create index rsID_idx 
    on peaks(rsID);

create index chrom_position_idx
    on peaks(chrom, position);

create index gene_idx
    on peaks(gene);

create index valueAvg_idx
    on peaks(valueAvg);


create table features_by_rsID (
    id                       integer primary key,
    rsID                     text    not null unique,
    minValueAvg              double  not null,
    mostSignificantFeatureID integer not null,
    nFeatures                integer not null,

    foreign key (mostSignificantFeatureID) references peaks (id)
);

create table features_by_gene (
    id                       integer primary key,
    gene                     text    not null unique,
    minValueAvg              double  not null,
    mostSignificantFeatureID integer not null,
    nFeatures                integer not null,

    foreign key (mostSignificantFeatureID) references peaks (id)
);

create table features_by_position (
    id                       integer primary key,
    chrom                    text    not null,
    position                 integer not null,
    minValueAvg              double  not null,
    mostSignificantFeatureID integer not null,
    nFeatures                integer not null,

    unique      (chrom, position),
    foreign key (mostSignificantFeatureID) references peaks (id)
);
