import React from 'react';
import { scaleLinear } from 'd3-scale'
import { ETHNICITY_BOX_COLOR } from '../constants/app'
import { getDomain } from '../helpers/boxplot'

const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺'

const FONT_SIZE = 14

const BAR_WIDTH = 40
const BAR_HALF_WIDTH = BAR_WIDTH / 2

const PADDING = 40

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
  const horizPadding = 25;

  const dimension = {
    x: PADDING + horizPadding,
    y: PADDING,
    width: width - PADDING,
    height: height - PADDING,
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
      <text x={(dimension.width / 2) + dimension.x - horizPadding - 8} y={20} textAnchor='middle'
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

function InnerBar({ xStart, xStop, yScale, stats, fill }) {
  const border = '#666666';

  const xLine = (xStart + xStop) / 2;

  return <g>
    <Rect stroke={border}
          fill={fill ?? "rgba(0, 0, 0, 0)"}
          position={[[xStart, yScale(stats.quartile_3)], [xStop, yScale(stats.quartile_1)]]} />
    <Line stroke={border}
          position={[[xLine, yScale(stats.min)], [xLine, yScale(stats.max)]]} />
    <Line stroke={border}
          position={[[xStart, yScale(stats.min)], [xStop, yScale(stats.min)]]} />
    <Line stroke={border}
          position={[[xStart, yScale(stats.max)], [xStop, yScale(stats.max)]]} />
    <Line stroke={border}
          position={[[xStart, yScale(stats.median)], [xStop, yScale(stats.median)]]} />
  </g>;
}

function Bar({ data, x, y, height, domain }) {
  // const min = data.min
  // const max = data.max

  /**
   * @type {{
   *   min: number,
   *   quartile_1: number,
   *   median: number,
   *   quartile_3: number,
   *   max: number
   * }} Stats
   */
  const stats = data.stats;

  /**
   * @type {{
   *   AF: Stats,
   *   EU: Stats
   * }}
   */
  const statsByEthnicity = data.statsByEthnicity;

  const afStats = statsByEthnicity.AF;
  const euStats = statsByEthnicity.EU;

  const xMin = x - BAR_HALF_WIDTH
  const xMax = x + BAR_HALF_WIDTH

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

  /* We've disabled point-level display for security reasons - David L, 2022-01-31 */

  if (!afStats || !euStats) {
    // Use overall stats, since we do not have enough AF/EU points to render ethnicity-level
    // box plots securely.
    return <InnerBar xStart={xMin} xStop={xMax} stats={stats} yScale={yScale} fill={"url(#diagonal)"} />;
  }

  return (
    <g>
      {/* AF */}
      <InnerBar
        xStart={xMin}
        xStop={x}
        stats={afStats}
        yScale={yScale}
        fill={ETHNICITY_BOX_COLOR.AF}
      />

      {/* EU */}
      <InnerBar
        xStart={x}
        xStop={xMax}
        stats={euStats}
        yScale={yScale}
        fill={ETHNICITY_BOX_COLOR.EU} />
    </g>
  )
}

function YAxis({ domain, step, x, y, height }) {
  const label = "Signal"

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
      <text fontSize={FONT_SIZE}
            x={-(height / 2)}
            y={20}
            textAnchor="end"
            transform="rotate(-90)">{label}</text>
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
                  x={15 + (5 - text.length) * 8}
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

function XAxis({ data, scale, x, height, width }) {
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
  end = Math.ceil(end)

  // let factor = 1
  // while (true) {
  //   const newEnd = Math.ceil(end * factor) / factor
  //   end = newEnd
  //   break
  // }

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
