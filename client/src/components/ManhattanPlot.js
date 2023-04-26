import React, {useMemo} from "react";

import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";

const drawPoints = (u, seriesIdx, idx0, idx1) => {
  const size = 5 * devicePixelRatio;

  uPlot.orient(u, seriesIdx, (series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc) => {
    let d = u.data[seriesIdx];

    u.ctx.fillStyle = series.stroke();

    let deg360 = 2 * Math.PI;

    let p = new Path2D();

    for (let i = 0; i < d[0].length; i++) {
      let xVal = d[0][i];
      let yVal = d[1][i];

      if (xVal >= scaleX.min && xVal <= scaleX.max && yVal >= scaleY.min && yVal <= scaleY.max) {
        let cx = valToPosX(xVal, scaleX, xDim, xOff);
        let cy = valToPosY(yVal, scaleY, yDim, yOff);

        p.moveTo(cx + size/2, cy);
        arc(p, cx, cy, size/2, 0, deg360);
      }
    }

    console.timeEnd("points");

    u.ctx.fill(p);
  });

  return null;
};

const ManhattanPlot = React.memo(({data, positionProp, pValueProp}) => {
  // const processedData = useMemo(() => data.filter(d => d[pValueProp]).map(d => ({
  //   ...d,
  //   x: d[positionProp] / 1000000,
  //   y: -1 * Math.log10(d[pValueProp]),
  // })), [data]);

  const x = useMemo(() => data.filter(d => d[pValueProp]).map(d => d[positionProp] / 1000000), [data]);
  const y = useMemo(() => data.filter(d => d[pValueProp]).map(d => -1 * Math.log10(d[pValueProp])), [data]);
  const finalData = useMemo(() => [x, y], [x, y]);

  return <UplotReact
    options={{
      title: "TODO",
      mode: 2, // ?
      width: 800,
      height: 600,
      // scales: {
      //   x: {time: false},
      // },
      series: [
        {},
        {
          stroke: "red",
          fill: "rgba(255, 255, 255, 0.1)",
          paths: drawPoints,
        },
      ],
    }}
    data={finalData}
  />;
});

// import {ScatterChart, ResponsiveContainer, XAxis, YAxis, Scatter} from "recharts";
//
// const ManhattanPlot = React.memo(({data, positionProp, pValueProp}) => {
//   const processedData = useMemo(() => data.filter(d => d[pValueProp]).map(d => ({
//     ...d,
//     x: d[positionProp] / 1000000,
//     y: -1 * Math.log10(d[pValueProp]),
//   })), [data]);
//
//   return <ResponsiveContainer width="100%" height={200}>
//     <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
//       <XAxis type="number" dataKey="x" name="position" unit="Mb" />
//       <YAxis type="number" dataKey="y" name="-log10(p)" />
//       <Scatter name="TODO" data={processedData} fill="#888844" />
//     </ScatterChart>
//   </ResponsiveContainer>;
// });

export default ManhattanPlot;
