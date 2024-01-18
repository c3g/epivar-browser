#!/bin/bash
#SBATCH --mem=16G
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --time=1:00:00
#SBATCH --account=rrg-bourqueg-ad

# CHAINFILE, CHROM_SIZES, BIGWIG_IN and BIGWIG_OUT environment variable pre-set

module load nixpkgs/16.09 gcc/7.3.0 kentutils/20180716

bgfile_in="${SLURM_TMPDIR}/in.bedGraph"
bgfile_out="${SLURM_TMPDIR}/out.bedGraph"
bgfile_out_sort="${SLURM_TMPDIR}/out.sorted.bedGraph"
bgfile_out_sort_fix_tmpfile="${SLURM_TMPDIR}/tmp.fixing.bed"
bgfile_out_sort_fix="${SLURM_TMPDIR}/out.sorted.fixed.bedGraph"

# Source: https://www.biostars.org/p/81185/

echo "bigWigToBedGraph"
bigWigToBedGraph "${BIGWIG_IN}" "${bgfile_in}"
ls -l "${SLURM_TMPDIR}"

echo "liftOver"
liftOver "${bgfile_in}" "${CHAINFILE}" "${bgfile_out}" "${SLURM_TMPDIR}/unmapped_discard"
ls -l "${SLURM_TMPDIR}"

echo "sort"
sort -k1,1 -k2,2n "${bgfile_out}" > "${bgfile_out_sort}"
awk -vOFS="\t" '{ print $1, $2, $3, ".", $4 }' "${bgfile_out_sort}" > "${bgfile_out_sort_fix_tmpfile}"
ls -l "${SLURM_TMPDIR}"

module load gcc/6.4.0 openmpi/2.1.1 bedops/2.4.35
echo "bedops | bedmap"
bedops --partition "${bgfile_out_sort_fix_tmpfile}" | \
  bedmap --echo --mean --delim '\t' - "${bgfile_out_sort_fix_tmpfile}" \
  >  "${bgfile_out_sort_fix}"
ls -l "${SLURM_TMPDIR}"

module load gcc/7.3.0 kentutils/20180716
bedGraphToBigWig "${bgfile_out_sort_fix}" "${CHROM_SIZES}" "${BIGWIG_OUT}"
