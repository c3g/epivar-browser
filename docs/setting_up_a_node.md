# Setting up an EpiVar node



## Requirements

* Docker
* Docker Compose plugin
* A reverse proxy such as NGINX, Trafik, or similar (configuring this is out of scope for this guide)
* A valid HTTPS certificate (configuring this is out of scope for this guide)



## Data and configuration requirements

### Raw data (stored on the node, not revealed publicly)

- [ ] A [bgzipped](http://www.htslib.org/doc/bgzip.html), [Tabix-indexed](http://www.htslib.org/doc/tabix.html) VCF 
  containing sample variants, using one of two available reference genomes (`hg19`/`hg38`).
- [ ] A set of normalized signal matrices: one per assay, each containing columns of samples and rows of features
      (see an [example for ATAC-seq](/input-files/matrices/ATAC-seq.example.tsv).)
- [ ] A set of bigWigs, one or two (forward/reverse view) per sample-assay pair.
- [ ] Peak and gene-peak-link CSV files:
  - TODO: PEAK DATA

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
     - `track.view`: literal value, one of `signal_forward` or `signal_reverse`
     - `track.track_type`: must be the literal value `bigWig`
     - `assay.name`: one of `RNA-Seq`, `ATAC-Seq`, `H3K27ac`, `H3K4me1`, `H3K27me3`, `H3K4me3`
    
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
  sample groups and experimental treatments, assembly ID (`hg19` or `hg38`), and how to find samples in the genotype 
  VCF file.

- [ ] A human-readable dataset description file, in [Markdown](https://commonmark.org/help/) format, to show in the 
  `About Dataset` tab in the portal. See [an example for the Aracena *et al.* dataset.](/epivar-prod/node1/about.md) 



## Deploying

In order to follow this guide, you should have experience deploying Docker containers, including configuring volumes,
networks, and environment variables.


### Pre-processing dataset metadata (if using an `.xlsx` file)

To turn a [metadata XLSX file](/input-files/flu-infection.xlsx) into a JSON file, run the following command:

```bash
docker run ghcr.io/c3g/epivar-server node ./scripts/metadata-to-json.js < path/to/metadata.xlsx > data/metadata.json
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

- TODO: Tracks (read-only)
- TODO: Merged tracks
- A folder to persist Redis cache data to. This is mounted to the Redis container at `/data`.
- TODO: DB


### Configuring the instance environment

TODO: session secret / database password are main ones required


### Starting the server

Assuming you have set up a Docker Compose file, similar to the one [we provide as an example](/example.docker-compose.yml),
you can start the node using the following command:

```bash
docker compose up -d
```


### Importing data

First, import the assembly gene list and gene-peak association data into the database using the following command:

```bash
docker compose exec epivar-server node ./scripts/import-genes.js
```

Then, import peaks and pre-computed peak matrix values into the database using the following command:

```bash
docker compose exec epivar-server node ./scripts/import-peaks.js
```

**Note:** This will take a while.

Then, calculate summary data for the peaks:

```bash
docker compose exec epivar-server node ./scripts/calculate-peak-groups.mjs
docker compose exec epivar-server node ./scripts/calculate-top-peaks.mjs
```

Finally, ensure the cache is clear in case any values have been added accidentally during data ingestion, or are 
remaining from prior data ingestions:

```bash
docker compose exec epivar-server node ./scripts/clear-cache.js
```



## Joining the EpiVar Portal federation

In order to connect an EpiVar node to the EpiVar Portal, the node must be publicly accessible with a valid HTTPS 
certificate and a reverse proxy passing traffic to the EpiVar server (the configuration of which is out of scope for 
this guide.) 

Then, contact us at [epivar@computationalgenomics.ca](mailto:epivar@computationalgenomics.ca), including information 
about your node, your dataset, and including the domain name + path of your instance, and we will decide whether to
include your node in the list of nodes available in the EpiVar Portal.
