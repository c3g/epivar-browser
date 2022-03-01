const scaleLinear = (...args) => import("d3-scale").then(
  ({scaleLinear}) => scaleLinear(...args));

// Constants


const SUPERSCRIPT = '⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺';

const FONT_SIZE = 14;

const BAR_WIDTH = 40;
const BAR_HALF_WIDTH = BAR_WIDTH / 2;

const textStyles = `font-size: ${FONT_SIZE}; font-family: sans-serif; text-anchor: middle`;  /*{
  fontSize: FONT_SIZE,
  textAnchor: 'middle',
};*/

const PLOT_SIZE = 350;
const PLOT_PADDING = 40;
const PLOT_HORIZ_PADDING = 25;

const plotDimensions = {
  x: PLOT_PADDING + PLOT_HORIZ_PADDING,
  y: PLOT_PADDING,
  width: PLOT_SIZE - PLOT_PADDING,
  height: PLOT_SIZE - PLOT_PADDING,
};

// Drawing

function boxPlotLine({position, stroke}) {
  return `
    <line
      x1="${position[0][0]}"
      y1="${position[0][1]}"
      x2="${position[1][0]}"
      y2="${position[1][1]}"
      stroke="${stroke || "black"}"
    />
  `;
}

function boxPlotRect({ position, stroke = 'black', fill = 'rgba(0, 0, 0, 0)', strokeDashArray="" }) {
  const dashAttr = strokeDashArray ? `stroke-dasharray="${strokeDashArray}"` : "";

  return `
    <rect
      x="${position[0][0]}"
      y="${position[0][1]}"
      width="${Math.abs(position[1][0] - position[0][0])}"
      height="${Math.abs(position[1][1] - position[0][1])}"
      stroke="${stroke}"
      fill="${fill}"
      ${dashAttr}
    />
  `;
}

async function boxPlotYAxis({domain, step, x, y, height}) {
  const label = "Signal";

  const points = []
  for (let i = domain[0]; i <= domain[1]; i += step) {
    points.push(i)
  }

  if (points[points.length - 1] !== domain[1]) {
    points.push(domain[1])
  }

  const scale = (await scaleLinear()).range([height, y]).domain(domain);

  let lastY = 0

  const ps = points.map(point => {
    const y = scale(point)

    const rounded = Number(Number(point).toPrecision(3))
    const abs = Math.abs(rounded)

    const text =
      (abs < 0.01 || abs > 999) && abs !== 0 ?
        toExponentString(rounded) : rounded.toString();

    const s = Math.abs(lastY - y) > FONT_SIZE ?
      `<text
         x="${15 + (5 - text.length) * 8}"
         y="${scale(point)}"
         dy="${FONT_SIZE / 4}" 
         style="font-size: ${FONT_SIZE}; font-family: monospace"
       >${text}</text>` : "";

    const result = `<g>${boxPlotLine({position: [[x - 5, y], [x, y]]})}${s}</g>`;

    if (Math.abs(lastY - y) > FONT_SIZE) {
      lastY = y;
    }

    return result;
  });

  return `<g>
    ${boxPlotLine({position: [[x, y], [x, height]]})}
    <text style="font-size: ${FONT_SIZE}; font-family: sans-serif"
          x="${-(height / 2)}"
          y="20"
          text-anchor="end"
          transform="rotate(-90)">${label}</text>
    ${ps.join("")}
  </g>`;
}

function boxPlotXAxis({data, scale, x, height, width}) {
  const inner = data.map((d, i) => {
    return `<g>
        ${boxPlotLine({position: [[scale(i), height], [scale(i), height + 5]]})}
        <text y="${height + 5}" x="${scale(i)}" dy="${FONT_SIZE}" style="${textStyles}">
          ${d.name}
        </text>
        <text y="${height + 5}" x="${scale(i)}" dy="${FONT_SIZE * 2}" style="${textStyles}">
          (n = ${d.data.n})
        </text>
      </g>`;
  }).join("");

  return `
    <g>
      ${boxPlotLine({position: [[x, height], [width, height]]})}
      ${inner}
    </g>
  `;
}

function boxPlotInnerBar({xStart, xStop, yScale, stats, fill}) {
  const stroke = '#333333';

  const xLine = (xStart + xStop) / 2;

  const box = boxPlotRect({
    stroke,
    fill: fill ?? "rgba(0, 0, 0, 0)",
    position: [[xStart, yScale(stats.quartile_3)], [xStop, yScale(stats.quartile_1)]],
  });

  const lines = [
    boxPlotLine({stroke, position: [[xLine, yScale(stats.min)], [xLine, yScale(stats.max)]]}),
    boxPlotLine({stroke, position: [[xStart, yScale(stats.min)], [xStop, yScale(stats.min)]]}),
    boxPlotLine({stroke, position: [[xStart, yScale(stats.max)], [xStop, yScale(stats.max)]]}),
    boxPlotLine({stroke, position: [[xStart, yScale(stats.median)], [xStop, yScale(stats.median)]]}),
  ]

  return `<g> ${box} ${lines.join("")} </g>`;
}

async function boxPlotBar({data, x, y, height, domain}) {
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

  const yScale = (await scaleLinear()).range([height, y]).domain(domain);

  if (data.n === 0) {
    const delta = domain[1] - domain[0]
    const text = 'Empty'
    const fill = 'rgba(0, 0, 0, 0.01)'
    const border = '#bbbbbb'
    const color = 'rgba(0, 0, 0, 0.1)'

    const rect = boxPlotRect({
      position: [[xMin, yScale(domain[1] - delta * 0.1)], [xMax, yScale(domain[0] + delta * 0.1)]],
      stroke: border,
      fill,
      strokeDashArray: "5,5",
    });

    const textTransform = `translate(${middle(xMin, xMax)+5} ${yScale(middle(domain[0], domain[1]))}) rotate(-90)`;

    return `
      <g>
        ${rect}
        <text
          text-anchor="middle"
          dominant-baseline='central'
          transform="${textTransform}"
          style="fill: ${color}; font-weight: bold; font-size: 18px; font-family: sans-serif; text-anchor: middle;"
        >
          ${text}
        </text>
      </g>
    `;
  }

  /* We've disabled point-level display for security reasons - David L, 2022-01-31 */

  if (!afStats || !euStats) {
    // Use overall stats, since we do not have enough AF/EU points to render ethnicity-level
    // box plots securely.
    return boxPlotInnerBar({
      xStart: xMin,
      xStop: xMax,
      stats,
      yScale,
      // fill: "url(#diagonal)",
    });
  }

  const afBar = boxPlotInnerBar({
    xStart: xMin,
    xStop: x,
    stats: afStats,
    yScale,
    // fill: ETHNICITY_BOX_COLOR.AF,
  });

  const euBar = boxPlotInnerBar({
    xStart: x,
    xStop: xMax,
    stats: euStats,
    yScale,
    // fill: ETHNICITY_BOX_COLOR.EU,
  });

  return `<g> ${afBar} ${euBar}</g>`;
}

async function boxPlot({title, data, domain, transform}) {
  if (!data) {
    return "<svg />";
  }

  domain = domain ?? getDomain(data);

  const yAxis = getYAxisDetails(domain);
  const yDomain = [yAxis.start, yAxis.end];

  const start = plotDimensions.width / (data.length + 2);
  // const xScale = TODO;

  const xScale = (await scaleLinear())
    .range([plotDimensions.x + start, plotDimensions.width])
    .domain([0, data.length]);

  const axes = await Promise.all([
    boxPlotYAxis({domain: yDomain, step: yAxis.step, ...plotDimensions}),
    boxPlotXAxis({data, scale: xScale, ...plotDimensions}),
  ]);

  const bars = await Promise.all(
    data.map((d, i) => boxPlotBar({
      data: d.data,
      ...plotDimensions,
      x: xScale(i),
      domain: yDomain,
    }))
  );

  return `
    <g transform="${transform || ""}">
      ${axes.join("")}
      <text x="${(plotDimensions.width / 2) + plotDimensions.x - PLOT_HORIZ_PADDING - 8}" y="20" 
            text-anchor="middle" 
            style="font-weight: bold; font-family: sans-serif">
        ${title}
      </text>
      ${bars.join("")}
    </g>`;
}


// Helpers

function getDomain(categories) {
  if (!categories?.length) {
    return undefined;
  }

  let min =  Infinity;
  let max = -Infinity;

  categories.forEach(({ data }) => {
    if (data.stats.min < min)
      min = data.stats.min
    if (data.stats.max > max)
      max = data.stats.max
  });

  return [
    min,
    max,
  ];
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

// ---

module.exports = {
  PLOT_SIZE,
  getDomain,
  boxPlot,
};
