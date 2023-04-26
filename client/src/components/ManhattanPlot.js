import React, {useMemo} from "react";

import {ScatterChart, ResponsiveContainer, XAxis, YAxis, Scatter} from "recharts";

const ManhattanPlot = React.memo(({data, positionProp, pValueProp}) => {
  const processedData = useMemo(() => data.filter(d => d[pValueProp]).map(d => ({
    ...d,
    x: d[positionProp] / 1000000,
    y: -1 * Math.log10(d[pValueProp]),
  })), [data]);

  return <ResponsiveContainer width="100%" height={200}>
    <ScatterChart margin={{top: 20, right: 20, bottom: 20, left: 20}}>
      <XAxis type="number" dataKey="x" name="position" unit="Mb" />
      <YAxis type="number" dataKey="y" name="-log10(p)" />
      <Scatter name="TODO" data={processedData} fill="#888844" />
    </ScatterChart>
  </ResponsiveContainer>
});

export default ManhattanPlot;
