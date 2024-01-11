# Setting up an EpiVar node



## Requirements

* Docker
* Docker Compose plugin
* A reverse proxy such as NGINX, Trafik, or similar (configuring this is out of scope for this guide)
* A valid HTTPS certificate (configuring this is out of scope for this guide)



## Data and configuration requirements

### Available assays

The following assay types can be ingested into an EpiVar node:

- RNA-seq
- ATAC-seq
- H3K4me1
- H3K4me3
- H3K27ac
- H3K27me3

### Dataset metadata

- [ ] A metadata file for the bigWig tracks, which can be one of the following:
  - An XLSX file with one or more sheets
    (see [an example for the Aracena *et al.* dataset](/input-files/flu-infection.xlsx)), each with the following
    headers:
    - `file.path`: relative path to `bigWig`, without the `EPIVAR_TRACKS_DIR` environment variable directory prefix
    - `ethnicity`: ethnicity / population group **ID** (*not* name!)
      - if set to `Exclude sample`, sample will be skipped
    - `condition`: condition / experimental group **ID** (*not* name!)
    - `sample_name`: Full sample name, uniquely indentifying the sample within
      `assay`, `condition`, `donor`, and `track.view` variables
    - `donor`: donor ID (i.e., individual ID)
    - `track.view`: literal value, one of `signal_forward`, `signal_reverse`, or `signal_unstranded`
    - `track.track_type`: must be the literal value `bigWig`
    - `assay.name`: one of the [available assays](#available-assays)

    The file may have additional headers, but these will be discarded internally.
  - **OR**, a JSON file containing a list of objects with the following keys, mapping to the above headers in order:
    - `path`
    - `ethnicity`
    - `condition`
    - `sample_name`
    - `donor`
    - `view`
    - `type`
    - `assay`

- [ ] A dataset configuration file, which takes the form described in the
  [example configuration file](/config.example.js).

  This file specifies information about the dataset being hosted by the EpiVar node, including dataset title,
  sample groups and experimental treatments (in both of these, each entry has an ID and a name), assembly ID (`hg19` or
  `hg38`), and how to find samples in the genotype VCF file.

- [ ] A human-readable dataset description file, in [Markdown](https://commonmark.org/help/) format, to show in the
  `About Dataset` tab in the browser. See [an example for the Aracena *et al.* dataset.](/epivar-prod/node1/about.md)

### Raw data (stored on the node, not revealed publicly)

- [ ] A [bgzipped](http://www.htslib.org/doc/bgzip.html), [Tabix-indexed](http://www.htslib.org/doc/tabix.html) VCF 
  containing sample variants, using one of two available reference genomes (`hg19`/`hg38`).

- [ ] A set of normalized signal matrices: one per assay, each containing columns of samples and rows of features
      (see an [example for ATAC-seq](/input-files/matrices/ATAC-seq.example.tsv).)

- [ ] A set of bigWigs, one or two (in the case of RNA-seq; forward/reverse view) per sample-assay pair.

- [ ] Peak and gene-peak-link CSV files, respectively containing the following:

    - Peak files are, by default, named according to the template: `<qtls-directory>/QTLs_complete_$ASSAY.csv`, where 
      `$ASSAY` is one of the [available assays](#available-assays). This template naming can be changed (keeping the 
      `$ASSAY` replaceable value) using the `EPIVAR_QTLS_TEMPLATE` environment variable.
      
      They are CSVs where each row contains data about the SNP, the *p*-value associations between the genotypes and 
      each treatment, and the corresponding assay. There are a couple truncated example files in 
      [`/input-files/qtls`](/input-files/qtls). The required headings are the following:

        - `rsID`: The rsID of the SNP
        - `snp`: The SNP in the SNP-peak association; formatted like `chr#_######`
          (UCSC-formatted chromosome name, underscore, position)
        - `feature`: The feature name - either `chr#_startpos_endpos` or `GENE_NAME`
        - `pvalue.*` where `*` is the **ID** of the condition, as specified in the `metadata.json` file (see above.)
          - These are floating point numbers
        - `feature_type`: The assay the peak is from - e.g., `RNA-seq`
      
      As an example, the header row for the Aracena *et al.* dataset's RNA-seq QTLs file is the following:
      `rsID,snp,feature,pvalue.NI,pvalue.Flu,feature_type`

    - Some peaks are associated with genes, and their links should be provided in a gene-peak-link CSV file.
      This takes the form of a CSV *with header row*:
      `"symbol","peak_ids","feature_type"` where `symbol` is gene symbol, and should be unique; `peak_ids`
      is a feature string composed of an underscore-separated contig/start position/end position 
      (e.g., `chr1_9998_11177`); and `feature_type` is the name of the assay 
      (see [available assays](#available-assays).)
      
      See [the version of this file](/input-files/flu-infection-gene-peaks.csv) for the hg19 Aracena *et al.* dataset 
      for an example.



## Deploying

In order to follow this guide, you should have experience deploying Docker containers, including configuring volumes,
networks, and environment variables.


### Pre-processing dataset metadata (if using an `.xlsx` file)

To turn a [metadata XLSX file](/input-files/flu-infection.xlsx) into a JSON file, run the following command:

```bash
# the -i is important here; otherwise, the metadata.json file will be blank!
docker run -i ghcr.io/c3g/epivar-server node ./scripts/metadata-to-json.js < path/to/metadata.xlsx > data/metadata.json
```

Alternatively, generate a metadata JSON matching the [required format](#dataset-metadata) directly.


### Creating volume locations for data

In a production instance, you will need the multiple volumes/bind-mounts from the host filesystem to the server Docker 
container.

#### File binding

- Your dataset's config file should be bound to `/app/config.js` inside the container.
- Your dataset's about file (in Markdown format) should be bound to `/app/data/about.md` inside the container.
- The genotype `.vcf.gz` and `.vcf.gz.tbi` should be bound to `/app/data/genotypes.vcf.gz` and
  `/app/data/genotypes.vcf.gz.tbi`, respectively.
- Your `metadata.json` file, pre-existing or as created above, should be bound to `/app/data/metadata.json`.

#### Folder binding

- The node must be provided with a tracks folder containing subfolders and bigWig files matching the paths specified
  in the `metadata.json` file described above. This folder can be bound as read-only, and should be bound to `/tracks`, 
  e.g.: `/path/to/tracks-dir:/tracks:ro`.
- The node must be provided with a readable/writable volume in which to place merged tracks, computed on-the-fly for 
  visualization, bound to `/mergedTracks` inside the container, e.g.: `/volumes/mergedTracks:/mergedTracks`.
- The Redis container, used for caching, does not strictly require a filesystem mount. However, to preserve the cache
  across system restarts, a readable/writable volume should be bound to the Redis container's `/data` path, e.g.: 
  `/volumes/redis:/data`.
- The database must be persisted to the host filesystem, bound to `/var/lib/postgresql/data` inside the container, e.g.: 
  `/volumes/db:/var/lib/postgresql/data`.


### Configuring the instance environment

There are a few required environment variables that do not have default values that must be configured when deploying a 
node. Some of these required environment variables are secrets, so they should not be shared or made public:

```bash
EPIVAR_NODE_BASE_URL=https://my-node-url.example.org
EPIVAR_SESSION_SECRET=some-long-secret-value-do-not-share-me
POSTGRES_PASSWORD=my-secure-password
EPIVAR_PG_CONNECTION=postgresql://postgres:my-secure-password@epivar-db:5432/postgres
```

#### Notes

- `EPIVAR_NODE_BASE_URL` should not have a trailing slash, nor the `/api` suffix even though API endpoints are off of 
  this suffix.

- These environment variables can either be configured in a `.env` file and attached to a Docker Compose container via
  the `env_file` directive attached to both the EpiVar server container and the Postgres container, or put into the
  `environment` directive in the Compose file directly - `EPIVAR_SESSION_SECRET` and `EPIVAR_PG_CONNECTION` are for the 
  EpiVar server container, and `POSTGRES_PASSWORD` is for the Postgres container. Either way, **make sure not to commit 
  them to any public repository.**

- Several other configuration options are available, and documented in commented code, in the 
  [`/envConfig.js`](/envConfig.js) file. A lot of the default values here match how the Docker container is configured,
  especially the filesystem path options, so change with caution.


### Starting the server

Assuming you have set up a Docker Compose file, similar to the one [we provide as an example](/example.docker-compose.yml),
you can start the node using the following command:

```bash
docker compose up -d
```


### Importing data

First, import the assembly gene list and gene-peak association data into the database using the following command:

```bash
docker compose exec -i epivar-server node ./scripts/import-genes.mjs < ./input-files/flu-infection-gene-peaks.csv
```

Then, import peaks and pre-computed peak matrix values into the database using the following command:

```bash
docker compose exec epivar-server node ./scripts/import-peaks.js
```

**Note:** This will take a while.

Then, calculate summary data for the peaks:

```bash
# Aggregate data for peaks grouped by SNP and gene, used for autocomplete:
docker compose exec epivar-server node ./scripts/calculate-peak-groups.mjs

# Used to generate Manhattan plots for chromosome/assay pairs, binned by SNP position:
docker compose exec epivar-server node ./scripts/calculate-top-peaks.mjs
```

Finally, ensure the cache is clear in case any values have been added accidentally during data ingestion, or are 
remaining from prior data ingestions:

```bash
docker compose exec epivar-server node ./scripts/clear-cache.js
```



## Joining the EpiVar Browser federation

In order to connect an EpiVar node to the EpiVar Browser portal, the node must be publicly accessible with a valid HTTPS 
certificate and a reverse proxy passing traffic to the EpiVar server (the configuration of which is out of scope for 
this guide.) 

Then, contact us at [epivar@computationalgenomics.ca](mailto:epivar@computationalgenomics.ca), including information 
about your node, your dataset, and including the domain name + path of your instance, and we will decide whether to
include your node in the list of nodes available in the EpiVar Browser.
