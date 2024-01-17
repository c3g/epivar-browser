#!/bin/bash
#SBATCH --mem=8G
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --time=1:00:00
#SBATCH --account=rrg-bourqueg-ad

module load nixpkgs/16.09 gcc/7.3.0
module load kentutils/20180716
module load python/3.8

source env/bin/activate

python3 ./peaks_liftover.py
