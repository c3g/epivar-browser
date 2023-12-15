#!/bin/bash

cd /home/dlough2/epivar/ || exit

for f in /home/dlough2/scratch/epivar/RNAseq/*; do
  echo "submitting job for ${f}"
  sbatch --export "ALL,BIGWIG_IN=${f},BIGWIG_OUT=${f%.bw}.hg38.bw,CHAINFILE=hg19ToHg38.over.chain,CHROM_SIZES=hg38.chrom.sizes" ./bw_liftover.bash
done
