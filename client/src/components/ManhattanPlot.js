import React, {useMemo} from "react";

import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";

const TAU = 2 * Math.PI;
const POINT_SIZE = 5 * devicePixelRatio;

// The below function is adapted from uPlot example, used under the terms of the MIT license.
// See https://github.com/leeoniya/uPlot/blob/master/demos/scatter.html
/*
The MIT License (MIT)

Copyright (c) 2022 Leon Sorokin

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */
const drawPoints = (u, seriesIdx) => {
  uPlot.orient(u, seriesIdx, (
    series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc
  ) => {
    const d = u.data[seriesIdx];

    u.ctx.fillStyle = series.stroke();

    const p = new Path2D();

    for (let i = 0; i < d[0].length; i++) {
      const x = d[0][i];
      const y = d[1][i];

      if (x >= scaleX.min && x <= scaleX.max && y >= scaleY.min && y <= scaleY.max) {
        const cx = valToPosX(x, scaleX, xDim, xOff);
        const cy = valToPosY(y, scaleY, yDim, yOff);
        p.moveTo(cx + POINT_SIZE / 2, cy);
        arc(p, cx, cy, POINT_SIZE / 2, 0, TAU);
      }
    }

    u.ctx.fill(p);
  });

  return null;
};

const ManhattanPlot = React.memo(({data, positionProp, pValueProp}) => {
  const x = useMemo(() => data.filter(d => d[pValueProp]).map(d => d[positionProp] / 1000000), [data]);
  const y = useMemo(() => data.filter(d => d[pValueProp]).map(d => -1 * Math.log10(d[pValueProp])), [data]);
  const finalData = useMemo(() => [[[], []], [x, y]], [x, y]);

  const maxY = useMemo(() => Math.max(...y) * 1.1, [y]);

  // noinspection JSValidateTypes
  return <UplotReact
    options={{
      title: "TODO",
      mode: 2, // ?
      width: 1000,
      height: 300,
      scales: {
        x: {time: false},
        y: {range: [1, maxY]},
      },
      axes: [
        {label: "Position (Mb)"},
        {label: "-log10(p)"},
      ],
      series: [
        {},  // weird uPlot hack to make scatter plots
        {
          label: "Most significant regional peak",
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