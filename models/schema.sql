-- schema.sql
-- (c) 2020-2023 McGill University
-- authors: Romaine Gregoire (original SQLite version); David Lougheed

-- CONSENTS -------------------------------------------------------------------
create table if not exists term_consents
(
    -- Core columns related to consents
    id       serial  primary key,
    issuer   text    not null,
    sub      text    not null, -- subject - user ID within the issuer
    version  integer not null check (version > 0),
    consent  bool    not null,  -- has the user consented to this version of the terms

    -- Extra profile information for identification
    idp      text    not null default '',  -- Blank until we get CILogon going
    idp_name text    not null default '',  -- Blank until we get CILogon going
    email    text    not null default '',  -- Blank until we get CILogon going
    
    -- Extra profile information, unstructured
    extra    jsonb   not null default '{}'::jsonb,

    UNIQUE (issuer, sub)
);

create table if not exists term_consents_ip
(
    id       serial    primary key,
    ip_addr  text      not null,
    version  integer   not null check (version > 0),
    consent  bool      not null,  -- has the user consented to this version of the terms
    ts       timestamp not null default (now() at time zone 'utc'),
    UNIQUE (ip_addr)
);
-------------------------------------------------------------------------------

-- ASSAYS ---------------------------------------------------------------------
create table if not exists assays
(
    "id"    smallserial primary key,
    "name"  text        not null unique
);
insert into assays (name)
values ('RNA-seq'), ('ATAC-seq'), ('H3K4me1'), ('H3K4me3'), ('H3K27ac'), ('H3K27me3')
on conflict on constraint assays_name_key do nothing;
-------------------------------------------------------------------------------


-- GENES AND FEATURES ---------------------------------------------------------
create table if not exists genes
(
    "id"        serial       primary key,  -- use an integer rather than a gene name for space
    "name_norm" varchar(22)  not null unique,
    "name"      varchar(22)  not null unique
);
create table if not exists features
(
    -- Even though it's duplicating information, we use an int as the pk to
    -- save on storage.
    "id"     serial      primary key,  -- use an integer rather than a gene name for space   TODO: small serial?
    "nat_id" varchar(50) not null unique,
    "chrom"  varchar(22) not null,
    "start"  integer     not null,
    "end"    integer     not null,
    "strand" varchar(1),
    "assay"  smallint    not null,  -- put assay next to strand to keep tuple smaller
    "gene"   integer,

    -- optional:
    --  pre-computed, (presumably batch-corrected etc.) array of treatment-arrays of points for the peak to render in
    --  the box plot, instead of pulling live from the bigWigs. treatments and samples MUST be in alphabetical order of
    --  their IDs, eg [Flu: [<value for AF01>, ..., <value for EU01>], NI: [...]]
    -- if the array is NULL, points SHOULD be pulled from bigWigs instead
    "points" real[]      default null,

    foreign key ("assay") references assays ("id"),
    foreign key ("gene")  references genes  ("id")
);
-------------------------------------------------------------------------------

-- PEAKS, SNPS, RELATED CACHED STUFF ------------------------------------------

create table if not exists snps
(
    "id"       serial      primary key,
    "nat_id"   varchar(32) unique,
    "chrom"    varchar(22) not null,
    "position" integer     not null  -- 32 bit - enough to contain
);

create table if not exists peaks
(
    "id"        serial   primary key,
    "snp"       integer  not null,
    "feature"   integer  not null,

    -- values as array of treatments (in alphabetical order): [<p_Flu>, <p_NI>]
    "values"    real[]   not null,

    foreign key ("snp")     references snps     ("id"),
    foreign key ("feature") references features ("id")
);

create index if not exists peaks_snp_idx
    on peaks("snp");

create index if not exists peaks_feature_idx
    on peaks("feature");


create table if not exists features_by_snp
(
    "id"                       serial  primary key,
    "snp"                      integer not null unique,
    "minValueMin"              real    not null,
    "mostSignificantFeatureID" integer not null,  -- TODO: rename
    "nFeatures"                integer not null,

    foreign key ("snp")                      references snps  ("id"),
    foreign key ("mostSignificantFeatureID") references peaks ("id")
);

create table if not exists features_by_gene
(
    "id"                       serial  primary key,
    "gene"                     integer not null unique,
    "minValueMin"              real    not null,
    "mostSignificantFeatureID" integer not null,  -- TODO: rename
    "nFeatures"                integer not null,

    foreign key ("gene")                     references genes ("id"),
    foreign key ("mostSignificantFeatureID") references peaks ("id")
);

-- create table if not exists features_by_position
-- (
--     id                       serial           primary key,
--     chrom                    text             not null,
--     position                 integer          not null,
--     minValueMin              double precision not null,
--     mostSignificantFeatureID integer          not null,
--     nFeatures                integer          not null,
--
--     unique      (chrom, position),
--     foreign key (mostSignificantFeatureID) references peaks (id)
-- );
-------------------------------------------------------------------------------

-- BINNED MOST SIGNIFICANT PEAKS (for Manhattan plots) ------------------------
create table if not exists binned_most_significant_peaks
(
    "id"         serial      primary key,
    "chrom"      varchar(22) not null,
    "pos_bin"    integer     not null,  -- binned by SNP position
    "peak"       integer,               -- nullable -> if null, no significant peak

    foreign key ("peak") references peaks ("id")
);
-------------------------------------------------------------------------------

-- SESSIONS -------------------------------------------------------------------
create table if not exists sessions
(
    "hash"     varchar(32) primary key,
    "samples"  text        not null,
    "peak"     text        not null
);
-------------------------------------------------------------------------------
