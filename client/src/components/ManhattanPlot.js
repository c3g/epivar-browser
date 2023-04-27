import React, {useCallback, useMemo, useRef} from "react";

import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";

import {quadtree} from "d3-quadtree";

import {useDevicePixelRatio} from "use-device-pixel-ratio";

const TAU = 2 * Math.PI;
const STROKE_WIDTH = 1;
const POINT_SIZE = 15;

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
// const drawPoints = (u, seriesIdx) => {
//   uPlot.orient(u, seriesIdx, (
//     series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc
//   ) => {
//     const d = u.data[seriesIdx];
//
//     u.ctx.fillStyle = series.stroke();
//
//     const p = new Path2D();
//
//     for (let i = 0; i < d[0].length; i++) {
//       const x = d[0][i];
//       const y = d[1][i];
//
//       if (x >= scaleX.min && x <= scaleX.max && y >= scaleY.min && y <= scaleY.max) {
//         const cx = valToPosX(x, scaleX, xDim, xOff);
//         const cy = valToPosY(y, scaleY, yDim, yOff);
//         p.moveTo(cx + POINT_SIZE / 2, cy);
//         arc(p, cx, cy, POINT_SIZE / 2, 0, TAU);
//       }
//     }
//
//     u.ctx.fill(p);
//   });
//
//   return null;
// };

const Cytoband = React.memo(({start, end, containerWidth}) => {
  // TODO
});

const ManhattanPlot = React.memo(({data, positionProp, pValueProp}) => {
  const pxr = useDevicePixelRatio({maxDpr: 50});
  const qt = useRef(null);

  const halfPointSize = useMemo(() => POINT_SIZE * pxr * 0.5, [pxr]);

  const dataNoNulls = useMemo(() => data.filter(d => !!d[pValueProp]), [data]);

  const x = useMemo(() => dataNoNulls.map(d => d[positionProp] / 1000000), [dataNoNulls]);
  const y = useMemo(() => dataNoNulls.map(d => -1 * Math.log10(d[pValueProp])), [dataNoNulls]);
  const finalData = useMemo(() => [[[], []], [x, y]], [x, y]);

  const maxY = useMemo(() => Math.max(...y) * 1.1, [y]);

  const drawPoints = useCallback((u, seriesIdx) => {
    const newQt = quadtree();

    uPlot.orient(u, seriesIdx, (
      series, dataX, dataY, scaleX, scaleY, valToPosX, valToPosY, xOff, yOff, xDim, yDim, moveTo, lineTo, rect, arc
    ) => {
      const d = u.data[seriesIdx];

      u.ctx.save();

      u.ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
      u.ctx.clip();

      u.ctx.fillStyle = series.fill();
      u.ctx.strokeStyle = series.stroke();
      u.ctx.lineWidth = STROKE_WIDTH;

      const p = new Path2D();

      for (let i = 0; i < d[0].length; i++) {
        const x = d[0][i];
        const y = d[1][i];

        if (x >= scaleX.min && x <= scaleX.max && y >= scaleY.min && y <= scaleY.max) {
          const cx = valToPosX(x, scaleX, xDim, xOff);
          const cy = valToPosY(y, scaleY, yDim, yOff);
          p.moveTo(cx + halfPointSize, cy);
          arc(p, cx, cy, halfPointSize, 0, TAU);

          // D3-quadtree: index 0 is X, index 1 is Y, rest can be other stuff
          newQt.add([
            // cx - halfPointSize - STROKE_WIDTH / 2 - u.bbox.left,
            cx - u.bbox.left,
            // cy - halfPointSize - STROKE_WIDTH / 2 - u.bbox.top,
            cy - u.bbox.top,
            i,
          ]);
        }
      }

      u.ctx.fill(p);
      u.ctx.stroke(p);
      u.ctx.restore();
    });

    qt.current = newQt;
    return null;
  }, [pxr]);

  // noinspection JSUnusedGlobalSymbols
  const uPlotOptions = useMemo(() => ({
    title: "chr1 RNA-seq: Most significant peaks by SNP position (25kb bins)",
    mode: 2, // ?
    width: 1110,
    height: 300,
    scales: {
      x: {time: false},
      y: {range: [1, maxY]},
    },
    axes: [
      {
        label: "Position",
        // scale: "Mb",
        values: (self, ticks) => ticks.map(v => `${v.toFixed(0)} Mb`),
      },
      {label: "-log10(p)"},
    ],
    series: [
      {},  // weird uPlot hack to make scatter plots
      {
        label: "Most significant regional peak",
        stroke: "#26A69A",
        fill: "rgba(38, 166, 154, 0.15)",
        paths: drawPoints,
      },
    ],
    cursor: {
      dataIdx(u, s) {
        if (s !== 1) return;  // Wrong series
        if (qt.current === null) return;  // No quadtree

        const {left, top} = u.cursor;

        const cx = left * pxr;
        const cy = top * pxr;

        const res = qt.current.find(cx - halfPointSize, cy - halfPointSize, POINT_SIZE * 1.6 * pxr);

        if (res) {
          document.body.style.cursor = "pointer";
        } else {
          document.body.style.cursor = "default";
        }

        return res ? res[2] : null;
      },
      points: {
        size: POINT_SIZE * pxr,
      },
    },
    hooks: {
      drawClear(u) {
        qt.current = quadtree();
        u.series.forEach((s, i) => {
          if (i > 0) s._paths = null;  // Force a redraw to populate the quadtree
        });
      },
    },
  }), [qt, pxr, halfPointSize])

  // noinspection JSValidateTypes
  return <div style={{boxSizing: "border-box", paddingTop: 16, textAlign: "center"}}>
    <UplotReact options={uPlotOptions} data={finalData} />
    <em style={{color: "#999"}}>Double-click to reset zoom.</em>
  </div>;
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
