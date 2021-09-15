/*
 * genes-to-sqlite.js
 */


const fs = require('fs')
const path = require('path')
const Database = require('sqlite-objects').Database
const Gene = require('../models/genes')


const inputPath = path.join(__dirname, '../input-files/flu-infection-genes.txt')
const outputPath = path.join(__dirname, '../data/genes.sqlite')
const schemaPath = path.join(__dirname, '../models/genes.sql')


;(async () => {
  const lines = fs.readFileSync(inputPath).toString().trim().split('\n')
  const genes = lines.map(parseGene)
  console.log(genes)
  console.log(genes.length, 'records')

  // Remove the database if it already exists
  fs.unlink(outputPath, err => (async () => {
    // Ignore file-not-found errors, since that is OK

    if (!err) console.log(`Removed existing database at '${outputPath}'`)

    const db = new Database(outputPath, schemaPath)
    await db.ready
    await db.insertMany(
      `INSERT INTO genes (id,  name, chrom, start, end, strand)
          VALUES       (@id, @name, @chrom, @start, @end, @strand)`,
      genes
    )
    console.log('Done')
  })())
})()


function parseGene(line) {
  const fields = line.trim().split('\t')
  return {
    id:     Gene.normalizeName(fields[0]),
    name:   fields[0],
    chrom:  fields[1],
    start: +fields[2],
    end:   +fields[3],
    strand: fields[4],
  }
}
