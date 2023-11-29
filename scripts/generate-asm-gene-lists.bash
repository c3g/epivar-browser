#!/usr/bin/env bash

# Populates the data/assembles/*/genes.txt files
# Run from root directory, not the scripts directory!

create_gene_list () {
  asm_id="${1}"
  gencode_url_fragment="${2}"
  gencode_file_version="${3}"
  echo "Creating gene list for ${asm_id} with Gencode v${gencode_file_version}"
  gencode_file="gencode.v${gencode_file_version}.annotation.gff3"
  if [[ ! -f "${gencode_file}" ]]; then
    wget "https://ftp.ebi.ac.uk/pub/databases/gencode/Gencode_${gencode_url_fragment}/${gencode_file}.gz"
    gunzip "${gencode_file}.gz"
  fi
  node ./scripts/gff3-to-gene-list.mjs "${gencode_file}" > "./data/assemblies/${asm_id}/genes.txt"
#  rm "${gencode_file}"
  echo "Done"
}

# HG19
create_gene_list 'hg19' 'human/release_44/GRCh37_mapping' '44lift37'

# HG38
create_gene_list 'hg38' 'human/release_44' '44'
