# Setting up an EpiVar node


## Dependencies

* Docker
* Docker Compose plugin
* A configurable reverse proxy such as NGINX, Trafik, or similar


## Data and configuration requirements

### Raw data (stored on the node, not revealed publicly)

- [ ] A VCF containing sample variants, using one of two available reference genomes (`hg19`/`hg38`)
- [ ] A set of normalized signal matrices: one per assay, each containing columns of samples and rows of features
      (see an [example for ATAC-seq](/input-files/matrices/ATAC-seq.example.tsv))
- [ ] A set of bigWigs, one or two (forward/reverse view) per sample-assay pair
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
- [ ] A human-readable dataset description file, to show in the `About Dataset` tab in the portal. TODO

  
## Deploying

TODO


## Joining the EpiVar Portal federation

TODO
