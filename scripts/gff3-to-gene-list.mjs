import gffDefault from "@gmod/gff";
import fs from "node:fs";
import process from "node:process";

const gffPath = process.argv.at(-1);  // second-last argument is gff3 file

const genes = {};

// noinspection JSUnresolvedReference
const gff = gffDefault.default;

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

      const geneName = attributes["gene_name"][0];

      if (geneName in genes) {
        process.stderr.write(`\t\tfound "duplicate" gene entry: ${geneName}\n`);
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
  });
