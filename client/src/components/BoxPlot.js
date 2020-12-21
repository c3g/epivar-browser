import React from 'react';
import { scaleLinear } from 'd3-scale'
import { ETHNICITY_COLOR } from '../constants/app'
import { getDomain } from '../helpers/boxplot'

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺'

const FONT_SIZE = 14

const BAR_WIDTH = 40
const BAR_HALFWIDTH = BAR_WIDTH / 2

const PADDING = 40
const POINT_RADIUS = 4

const textStyles = {
  fontSize: FONT_SIZE,
  textAnchor: 'middle',
}

export default function BoxPlot({
  title,
  data,
  width,
  height,
  domain = getDomain(data),
}) {

  const dimension = {
    x: PADDING + 20,
    y: PADDING,
    width: width - 1 * PADDING,
    height: height - 1 * PADDING,
  }

  const yAxis = getYAxisDetails(domain)
  const yDomain = [yAxis.start, yAxis.end]

  const start = dimension.width / (data.length + 2)
  const xScale = scaleLinear()
    .range([dimension.x + start, dimension.width])
    .domain([0, data.length])

  return (
    <svg width={width} height={height}>
      <YAxis domain={yDomain} step={yAxis.step} {...dimension} />
      <XAxis data={data} scale={xScale} {...dimension} />
      <text x={dimension.width / 2} y={20} textAnchor='middle'
        style={{
          fontWeight: 'bold',
        }}
      >
        { title }
      </text>
      {
        data.map((d, i) =>
          <Bar key={i} data={d.data} { ...dimension } x={xScale(i)} domain={yDomain} />
        )
      }
    </svg>
  )
}

function Bar({ data, x, y, height, domain }) {
  const min = data.min
  const max = data.max
  const stats = data.stats

  const xMin = x - BAR_HALFWIDTH
  const xMax = x + BAR_HALFWIDTH

  const yScale = scaleLinear().range([height, y]).domain(domain)

  if (data.n === 0) {
    const delta = domain[1] - domain[0]
    const text = 'Empty'
    const fill = 'rgba(0, 0, 0, 0.01)'
    const border = '#bbbbbb'
    const color = 'rgba(0, 0, 0, 0.1)'

    return (
      <g>
        <Rect
          position={[[xMin, yScale(domain[1] - delta * 0.1)], [xMax, yScale(domain[0] + delta * 0.1)]]}
          stroke={border}
          fill={fill}
          strokeDasharray='5,5'
        />
        <text
          textAnchor='middle'
          dominantBaseline='central'
          transform={`translate(${middle(xMin, xMax)} ${yScale(middle(domain[0], domain[1]))}) rotate(-90)`}
          style={{ fill: color, fontWeight: 'bold', fontSize: '18px' }}
        >
          { text }
        </text>
      </g>
    )
  }

  const border = '#666666'

  const afPoints = data.points.AF || []
  const euPoints = data.points.EU || []

  const padding = 5
  const afXRange = [xMin + padding, x - padding]
  const euXRange = [x + padding, xMax - padding]

  const afScale = scaleLinear().range(afXRange).domain([0, afPoints.length || 1])
  const euScale = scaleLinear().range(euXRange).domain([0, euPoints.length || 1])

  return (
    <g>
      <Line stroke={border} position={[[x, yScale(min)], [x, yScale(max)]]} />
      <Line stroke={border} position={[[xMin, yScale(min)], [xMax, yScale(min)]]} />
      <Line stroke={border} position={[[xMin, yScale(max)], [xMax, yScale(max)]]} />
      <Rect stroke={border} position={[[xMin, yScale(stats.end)], [xMax, yScale(stats.start)]]} />
      <Line stroke={border} position={[[xMin, yScale(stats.median)], [xMax, yScale(stats.median)]]} />

      {afPoints.map((value, i) =>
        <circle
          key={i}
          cx={afScale(i)}
          cy={yScale(value)}
          r={POINT_RADIUS}
          fill={ETHNICITY_COLOR.AF}
          opacity='0.4'
        />
      )}
      {euPoints.map((value, i) =>
        <circle
          key={i}
          cx={euScale(i)}
          cy={yScale(value)}
          r={POINT_RADIUS}
          fill={ETHNICITY_COLOR.EU}
          opacity='0.6'
        />
      )}
    </g>
  )
}

function YAxis({ domain, step, x, y, height }) {

  const points = []
  for (let i = domain[0]; i <= domain[1]; i += step) {
    points.push(i)
  }
  if (points[points.length - 1] !== domain[1])
    points.push(domain[1])

  const scale =
    scaleLinear().range([height, y]).domain(domain)

  let lastY = 0

  return (
    <svg>
      <Line position={[[x, y], 
                       [x, height]]} />
      {
        points.map(point => {
          const y = scale(point)

          const rounded = Number(Number(point).toPrecision(3))
          const abs = Math.abs(rounded)

          const text =
            (abs < 0.01 || abs > 999) && abs !== 0 ?
              toExponentString(rounded) : rounded.toString()

          const result =  (
            <g key={point}>
              <Line position={[[x - 5, y], [x, y]]} />
              {
                Math.abs(lastY - y) > FONT_SIZE &&
                <text
                  x={5 + (5 - text.length) * 8}
                  y={scale(point)}
                  dy={FONT_SIZE / 4}
                  fontSize={FONT_SIZE}
                  fontFamily='monospace'
                >
                    { text }
                  </text>
              }
            </g>
          )

          if (Math.abs(lastY - y) > FONT_SIZE)
            lastY = y

          return result
        })
      }
    </svg>
  )
}

function XAxis({ data, scale, x, y, height, width }) {
  return (
    <svg>
      <Line position={[[x,     height], 
                       [width, height]]} />
      {
        data.map((d, i) => {
          return (
            <g key={i}>
              <Line position={[[scale(i), height], [scale(i), height + 5]]} />
              <text y={height + 5} x={scale(i)} dy={FONT_SIZE} style={textStyles}>
                { d.name }
              </text>
              <text y={height + 5} x={scale(i)} dy={FONT_SIZE * 2} style={textStyles}>
                { `(n = ${d.data.n})` }
              </text>
            </g>
          )
        })
      }
    </svg>
  )
}

function Line({ position, stroke = 'black' }) {
  return (
    <line
      x1={position[0][0]}
      y1={position[0][1]}
      x2={position[1][0]}
      y2={position[1][1]}
      stroke={stroke}
    />
  )
}

function Rect({ position, stroke = 'black', fill = 'rgba(0, 0, 0, 0)', ...rest }) {
  return (
    <rect
      x={position[0][0]}
      y={position[0][1]}
      width={Math.abs(position[1][0] - position[0][0])}
      height={Math.abs(position[1][1] - position[0][1])}
      stroke={stroke}
      fill={fill}
      { ...rest }
    />
  )
}


function getYAxisDetails(domain) {
  if (!domain)
    return { start: 0, end: 1, step: 0.5 }

  const [min, max] = domain

  const delta = max !== min ? max - min : 1

  const padding = Math.round(delta * 0.1 * 4) / 4

  let start = min - padding
  let end   = max + padding

  if (0 < min && Math.abs(min) < (delta * 0.5))
    start = 0

  start = Math.round(start * 100) / 100

  let factor = 1
  while (true) {
    const newEnd = Math.ceil(end * factor) / factor
    end = newEnd
    break
  }

  const step = (end - start) / 10

  return {
    start,
    end,
    step,
  }
}

function middle(a, b) {
  const d = b - a
  return a + d / 2
}

function toExponentString(n) {
  return n.toExponential().toString().replace(/e(.)(\d+)/, (m, sign, numbers) => {
    const signChar =  SUPERSCRIPT[sign === '-' ? 10 : 11]
    const exponent = numbers.toString().split('').map(c => SUPERSCRIPT[+c]).join('')
    return signChar + exponent
  })
}
