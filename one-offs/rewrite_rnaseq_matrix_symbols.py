#!/usr/bin/env python3

import csv
from tqdm import tqdm

symbol_lookup = {}

with open("/flu-infection-data/qtls/QTLs_complete_RNAseq_non_symbol.csv", "r") as nsf, \
        open("/flu-infection-data/qtls/QTLs_complete_RNA-seq.csv", "r") as sf:
    nsr = csv.DictReader(nsf)
    sr = csv.DictReader(sf)

    for nrow, srow in tqdm(zip(nsr, sr)):
        symbol_lookup[nrow["feature"]] = srow["feature"]

with open("/opt/varwig2/input-files/matrices/RNA-seq_batch.age.corrected_PCsreg.txt", "r") as rna_f, \
        open("/opt/varwig2/input-files/matrices/RNA-seq_batch.age.corrected_PCsreg_symbol.txt", "w") as rna_w:
    rna_w.write(next(rna_f))  # copy header
    for row in tqdm(rna_f):
        if not row.strip():
            continue
        rd = row.strip().split("\t")
        new_symbol = symbol_lookup.get(rd[0].strip("\""))
        if new_symbol is None:
            rna_w.write("\t".join(rd) + "\n")
            continue
        rna_w.write("\t".join((f"\"{new_symbol}\"", *rd[1:])) + "\n")
