import gffDefault from "@gmod/gff";
import fs from "node:fs";
import process from "node:process";

const gffPath = process.argv.at(-1);  // second-last argument is gff3 file

const genes = {};
const duplicateGeneNames = new Set();

// noinspection JSUnresolvedReference
const gff = gffDefault.default;

const OVERRIDE_GENE_LOCATIONS = {
  "ADAM6": "chr14",
  "SFTA3": "chr14",
  "SNORA31": "chr13",  // GENCODE v44lift37 maps this wrongly + additionally to chr4
  "SNORA68": "chr19",
  "SNORA72": "chr8",   // GENCODE v44lift37 maps this wrongly + additionally to chr1, 2, ...
  "SNORA75": "chr2",
  "SNORA77": "chr1:203",  // GENCODE v44lift37 maps this wrongly + additionally to earlier in chr1
  "SNORA79": "chr14",
  "snoU13": "chr13",
};

const IGNORED_GENES = [
  "5S_rRNA",
  "5_8S_rRNA",
  "Metazoa_SRP",
  "U1",
  "U2",
  "U3",
  "U4",
  "U6",
  "U7",
  "U8",
  "Y_RNA",
];

process.stderr.write("parsing GFF...\n");
fs.createReadStream(gffPath)
  .pipe(gff.parseStream({ parseFeatures: true }))
  .on("data", (data) => {
    if (data.directive || data.comment || data.sequence) {
      return;  // ignore non-feature entries
    }

    data.forEach(({ type, attributes, seq_id: seqID, start, end, strand }) => {
      if (type !== "gene") {
        return;
      }

      if (!seqID.startsWith("chr")) {
        return;
      }

      // Use just a single source: ENSEMBL
      // if (source !== "ENSEMBL") {
      //   return;
      // }

      const geneStatus = attributes["gene_status"]?.[0];
      if (geneStatus !== "KNOWN" && geneStatus !== undefined) {
        return;
      }

      const geneName = attributes["gene_name"][0];

      if (IGNORED_GENES.includes(geneName)) {
        return;  // many of these, not in Aracena et al. dataset --> ignore them
      }

      const geneTypes = attributes["gene_type"] ?? [];
      if (
        geneTypes.includes("transcribed_unprocessed_pseudogene") ||
        geneTypes.includes("pseudogene") ||
        geneTypes.includes("processed_pseudogene") ||
        geneTypes.includes("unprocessed_pseudogene")
      ) {
        return;
      }

      const overridePos = OVERRIDE_GENE_LOCATIONS[geneName];
      if (overridePos && !(`${seqID}:${start}`.startsWith(overridePos))) {
        process.stderr.write(`\t\tignoring gene ${geneName} in ${seqID}: pos should start with ${overridePos}\n`);
        return;
      }

      if (geneName in genes/* || duplicateGeneNames.has(geneName)*/) {
        process.stderr.write(`\t\tfound "duplicate" gene entry: ${geneName} (${JSON.stringify(attributes)})\n`);
        if (geneName in genes) {
        //   delete genes[geneName];
          duplicateGeneNames.add(geneName);
        }
        return;
      }

      genes[geneName] = [
        attributes["gene_name"][0],
        seqID,
        start.toString(),
        end.toString(),
        strand
      ];

      const nGenes = Object.keys(genes).length;
      if (nGenes % 1000 === 0) {
        process.stderr.write(`\tfound ${nGenes} genes\n`);
      }
    });
  })
  .on("close", () => {
    process.stderr.write("sorting genes by name...\n");
    const geneArray = Object.values(genes);
    geneArray.sort((a, b) => a[0].localeCompare(b[0]));

    process.stderr.write(`writing sorted gene list (${geneArray.length} entries)...\n`);
    geneArray.forEach((row) => {
      process.stdout.write(row.join("\t") + "\n");
    });

    const duplicates = Array.from(duplicateGeneNames).sort();
    process.stderr.write(`found ${duplicateGeneNames.size} duplicate gene names: ${JSON.stringify(duplicates)}\n`);
  });
