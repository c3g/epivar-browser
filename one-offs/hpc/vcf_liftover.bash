#!/bin/bash
#SBATCH --mem=30G
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --time=3-00
#SBATCH --account=rrg-bourqueg-ad

VCF_PATH="/home/dlough2/scratch/epivar/allSamples.hc.vqsr.mil.snpId.snpeff.dbnsfp.vcf"
VCF_GRCH38_OUT_PATH="/home/dlough2/scratch/epivar/allSamples.hc.vqsr.mil.snpId.snpeff.dbnsfp.GRCh38.vcf"
VCF_REJECT_PATH="/home/dlough2/scratch/epivar/reject.vcf"
CHAIN="/home/dlough2/epivar/GRCh37ToGRCh38.over.chain"
GRCH38="/cvmfs/soft.mugqic/CentOS6/genomes/species/Homo_sapiens.GRCh38/genome/Homo_sapiens.GRCh38.fa"

module load picard/2.26.3

java -Xmx22g -jar "$EBROOTPICARD"/picard.jar \
  LiftoverVcf \
  I="${VCF_PATH}" \
  O="${VCF_GRCH38_OUT_PATH}" \
  CHAIN="${CHAIN}" \
  R="${GRCH38}" \
  REJECT="${VCF_REJECT_PATH}" \
  WARN_ON_MISSING_CONTIG=true \
  VALIDATION_STRINGENCY=LENIENT
