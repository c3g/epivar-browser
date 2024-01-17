import csv
import pysam
import subprocess
import tqdm

from typing import Dict, List, Set, Tuple


HG38_CHAIN_FILE = "/home/dlough2/epivar/hg19ToHg38.over.chain"
HG38_VCF = "/home/dlough2/scratch/epivar/allSamples.hc.vqsr.mil.snpId.snpeff.dbnsfp.GRCh38.vcf.gz"


def lift_over_peaks(peaks_to_lift_over: Set[str]) -> Dict[str, str]:  # return dict { old: new }
    lift_over_in_bed = "./peaks-liftover-in.bed"
    lift_over_out_bed = "./peaks-liftover-out.bed"

    peaks = list(peaks_to_lift_over)

    with open(lift_over_in_bed, "w") as fh:
        for pi, p in enumerate(peaks):
            fh.write("\t".join(p.split("_")) + f"\tpeak{pi}\n")

    subprocess.run((
        "liftOver",
        lift_over_in_bed,
        HG38_CHAIN_FILE,
        lift_over_out_bed,
        "./lift-over-discard",
        "-bedPlus=3",
        "-tab",
        "-minMatch=0.75",  # reduce minimum number of bases needed to remap, so we get as many peaks as possible
    ))

    lifted_over_peaks: List[Tuple[str, str]] = []
    with open(lift_over_out_bed, "r") as fh:
        for line in fh:
            line_data = line.strip().split("\t")
            lifted_over_peaks.append(("_".join(line_data[:3]), line_data[3]))

    res: Dict[str, str] = {}

    peaks_iter = iter(enumerate(peaks))
    lifted_over_peaks_iter = iter(lifted_over_peaks)

    pi, p = next(peaks_iter)
    for lifted_p, lifted_p_name in lifted_over_peaks_iter:
        while lifted_p_name != f"peak{pi}":
            pi, p = next(peaks_iter)
        # names are the same, so we have a successful mapping
        res[p] = lifted_p

    return res


def load_qtl_rows_and_snps(fp: str, feature_type: str) -> Tuple[List[dict], Set[str], Set[str]]:
    qtl_rows: List[dict] = []
    peaks_to_lift_over: Set[str] = set()
    snps_to_lift_over: Set[str] = set()

    with open(fp, "r", newline="") as fh:
        reader = csv.DictReader(fh, delimiter=",", quotechar='"')
        for p in tqdm.tqdm(filter(lambda pp: pp["feature_type"] == feature_type, reader), desc="qtl peaks"):
            feature = p["feature"]
            if feature.startswith("chr") and len(feature.split("_")) != 3:
                continue
            qtl_rows.append(p)
            if feature.startswith("chr"):
                peaks_to_lift_over.add(feature)
            snps_to_lift_over.add(p["rsID"])

    return qtl_rows, peaks_to_lift_over, snps_to_lift_over


def lift_over_qtl_rows(qtl_rows: List[dict], snps_to_lift_over: Set[str], lifted_over_peaks: Dict[str, str]):
    vcf = pysam.VariantFile(HG38_VCF)
    lifted_over_snps: Dict[str, str] = {}  # dict of { rsID: chr#_######## }

    for contig in vcf.header.contigs:
        if "_" in contig:
            continue

        print(f"Lifting over SNPs in {contig}")

        for variant in tqdm.tqdm(vcf.fetch(contig), desc="vcf"):
            if variant.id not in snps_to_lift_over:
                continue
            lifted_over_snps[variant.id] = f"{contig}_{variant.pos}"

    print(f"{len(lifted_over_snps)} lifted over SNPs")

    for row in qtl_rows:
        if (rs_id := row["rsID"]) in lifted_over_snps:
            feature: str = row["feature"]
            yield {
                **row,
                "snp": lifted_over_snps[rs_id],
                "feature": lifted_over_peaks[feature] if feature.startswith("chr") else feature,
            }


def main():
    gene_peaks: List[dict] = []
    peaks_to_lift_over: Set[str] = set()

    with open("./flu-infection-gene-peaks.csv", "r", newline="") as fh:
        reader = csv.DictReader(fh, delimiter=",", quotechar='"')
        for p in tqdm.tqdm(reader, desc="gene-peaks"):
            gene_peaks.append(p)
            peak = p["peak_ids"]
            if len(peak.split("_")) == 3:
                peaks_to_lift_over.add(peak)

    qtl_rows: List[dict]
    snps_to_lift_over: Set[str]
    qtl_rows, pq, snps_to_lift_over = load_qtl_rows_and_snps("./QTLs_complete_RNA-seq.csv", "RNA-seq")
    peaks_to_lift_over |= pq

    print(f"{len(peaks_to_lift_over)} peaks to lift over")
    print(f"{len(snps_to_lift_over)} SNPs to lift over")

    lifted_over_peaks: Dict[str, str] = lift_over_peaks(peaks_to_lift_over)
    print(f"{len(lifted_over_peaks)} lifted over peaks")

    with open("./flu-infection-gene-peaks-hg38.csv", "w") as fh:
        writer = csv.DictWriter(fh, ("symbol", "peak_ids", "feature_type"), delimiter=",", quotechar='"')
        writer.writeheader()
        for gp in gene_peaks:
            if (lifted_over_peak := lifted_over_peaks.get(gp["peak_ids"])) is not None:
                writer.writerow({**gp, "peak_ids": lifted_over_peak})

    with open("./QTLs_complete_RNA-seq_hg38.csv", "w") as fh:
        writer = csv.DictWriter(
            fh,
            ("rsID", "snp", "feature", "pvalue.NI", "pvalue.Flu", "feature_type"),
            delimiter=",",
            quotechar='"')
        writer.writeheader()
        for row in tqdm.tqdm(lift_over_qtl_rows(qtl_rows, snps_to_lift_over, lifted_over_peaks), desc="qtl writer"):
            writer.writerow(row)


if __name__ == "__main__":
    main()
