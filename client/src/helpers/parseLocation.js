export default function parseLocation(input) {

  const [chrom, positionString] = input.split(':')

  const position = Number(positionString)
  const start = Math.max(position - 100000, 0)
  const end   = position + 100000

  return {
    chrom,
    position,
    start,
    end,
  }
}
