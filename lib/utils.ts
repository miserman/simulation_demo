export function makeBins(values: number[], size = 3) {
  let min = Infinity
  let max = -Infinity
  values.forEach(value => {
    if (value < min) min = value
    if (value > max) max = value
  })
  if (!isFinite(min)) return []
  min = Math.floor(min)
  max = Math.ceil(max)
  const n = Math.max(1, Math.ceil((max - min) / size))
  return Array.from({length: n}, (_, i) => min + i * size)
}

function kernel(x: number) {
  return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * Math.pow(x, 2))
}
export function density(bins: number[], values: number[], bandwidth = 3) {
  const n = values.length
  return bins.map(bin => {
    let est = 0
    values.forEach(value => {
      est += kernel((bin - value) / bandwidth)
    })
    return est / bandwidth / n
  })
}
