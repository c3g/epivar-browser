import React from 'react';

import { ETHNICITY_COLOR } from '../constants/app'
import AutoSizer from './AutoSizer'
import BoxPlot from './BoxPlot'

const defaultValues = { isLoading: true, data: {} }

function PeakBoxplot({ title, values = defaultValues }) {

  console.log(values)

  return (
    <div className='PeakBoxplot'>
      <h6 className='text-center'>{title}</h6>
      <AutoSizer disableHeight>
        {
          ({ width }) => {
            const boxWidth = width / 2

            return (
              <div className='PeakBoxplot__graphs'>
                {values.isLoading &&
                  <BoxPlot
                    title='Non-infected'
                    data={[]}
                    width={boxWidth}
                    height={boxWidth}
                  />
                }
                {values.data.NI &&
                  <BoxPlot
                    title='Non-infected'
                    data={getDataFromValues(values.data.NI)}
                    width={boxWidth}
                    height={boxWidth}
                  />
                }
                {values.data.Flu &&
                  <BoxPlot
                    title='Flu'
                    data={getDataFromValues(values.data.Flu)}
                    width={boxWidth}
                    height={boxWidth}
                  />
                }
              </div>
            )
          }
        }
      </AutoSizer>
      <div className='PeakBoxplot__legend'>
        <div className='PeakBoxplot__legend__item'>
          <span style={{ background: ETHNICITY_COLOR.AF }} /> African-American
        </div>
        <div className='PeakBoxplot__legend__item'>
          <span style={{ background: ETHNICITY_COLOR.EU }} /> European-American
        </div>
      </div>
    </div>
  )
}

function getDataFromValues(values) {
  return [
    { name: 'Hom Ref', data: values.REF || [] },
    { name: 'Het',     data: values.HET || [] },
    { name: 'Hom Alt', data: values.HOM || [] }
  ]
}

export default PeakBoxplot
