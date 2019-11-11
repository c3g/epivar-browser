import React from 'react';
import { scaleLinear } from 'd3-scale'


const FONT_SIZE = 15

const BAR_WIDTH = 50
const BAR_HALFWIDTH = BAR_WIDTH / 2

const POINT_RADIUS = 1

const textStyles = {
  fontSize: FONT_SIZE,
  textAnchor: 'middle',
}

export default function BoxPlot({ title, data, width, height, padding, domain }) {
  const dimension = {
    x: padding,
    y: padding,
    width: width - 1 * padding,
    height: height - 1 * padding,
  }

  const step = (domain[1] - domain[0]) / 10
  const start = dimension.width / (data.length + 2)
  const xScale = scaleLinear().range([dimension.x + start, dimension.width]).domain([0, data.length])

  return (
    <svg width={width} height={height}>
      <YAxis domain={domain} step={step} {...dimension} />
      <XAxis data={data} scale={xScale} {...dimension} />
      <text x={dimension.width / 2} y={dimension.y} textAnchor='middle'
        style={{
          fontWeight: 'bold',
        }}
      >
        { title }
      </text>
      {
        data.map((d, i) =>
          <Bar key={i} data={d.data} { ...dimension } x={xScale(i)} domain={domain} />
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

  if (data.hidden) {
    const delta = domain[1] - domain[0]

    return (
      <g>
        <Rect
          position={[[xMin, yScale(domain[1] - delta * 0.1)], [xMax, yScale(domain[0] + delta * 0.1)]]}
          stroke='grey'
          fill='rgba(0, 0, 0, 0.05)'
          strokeDasharray='5,5'
        />
        <text
          textAnchor='middle'
          dominantBaseline='central'
          transform={`translate(${middle(xMin, xMax)} ${yScale(middle(domain[0], domain[1]))}) rotate(-90)`}
          style={{ fill: 'rgba(0, 0, 0, 0.3)', fontWeight: 'bold', fontSize: '18px' }}
        >
          Hidden
        </text>
      </g>
    )
  }

  return (
    <g>
      <Line position={[[x, yScale(min)], [x, yScale(max)]]} />
      <Line position={[[xMin, yScale(min)], 
                       [xMax, yScale(min)]]} />
      <Line position={[[xMin, yScale(max)], 
                       [xMax, yScale(max)]]} />

      <Rect position={[[xMin, yScale(stats.end)],
                       [xMax, yScale(stats.start)]]} />
      <Line position={[[xMin, yScale(stats.median)],
                       [xMax, yScale(stats.median)]]} />
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

  const scale = scaleLinear().range([height, y]).domain(domain)

  let lastY = 0

  return (
    <svg>
      <Line position={[[x, y], 
                       [x, height]]} />
      {
        points.map(point => {

          const y = scale(point)

          const result =  (
            <g>
              <Line position={[[x - 5, y], [x + 5, y]]} />
              {
                Math.abs(lastY - y) > FONT_SIZE &&
                  <text x={5} y={scale(point)} dy={FONT_SIZE / 4} fontSize={FONT_SIZE}>
                    { Number(Number(point).toPrecision(3)) }
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
              <Line position={[[scale(i), height - 5], [scale(i), height + 5]]} />
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

function Line({ position }) {
  return (
    <line
      x1={position[0][0]}
      y1={position[0][1]}
      x2={position[1][0]}
      y2={position[1][1]}
      stroke='black'
    />
  )
}

function Rect({ position, stroke = 'black', fill = 'rgba(230, 200, 20, 0.5)', ...rest }) {
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

function getStats(points) {
  return {
    start:  points[~~(points.length * 1/4)],
    median: points[~~(points.length * 2/4)],
    end:    points[~~(points.length * 3/4)],
  }
}

function middle(a, b) {
  const d = b - a
  return a + d / 2
}
