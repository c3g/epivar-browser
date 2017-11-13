export default function parseLocation(input) {

  const [chrom, position] = input.split(':')
  const [start, end] = position.split('-').map(Number)

  return {
    chrom,
    start,
    end: end || (start + 1)
  }
}
