import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

import AutoSizer from './AutoSizer.js'
import BoxPlot from './BoxPlot.js'

const mapStateToProps = state => ({
  values: state.values
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ }, dispatch)

class Charts extends Component {

  render() {
    const { values } = this.props

    const data = Object.entries(values.map).map(([assay, valuesByType]) =>
      ({
        assay,
        data: Object.entries(valuesByType).map(([name, data]) =>
          ({ name: getLabel(name), data }))
      })
    )

    return (
      <AutoSizer disableHeight>
        {
          ({ width }) =>
            data.map(({ assay, data }) =>
              <BoxPlot title={assay}
                data={data}
                width={width}
                height={300}
                padding={40}
                domain={getDomain(data)}
              />
            )
        }
      </AutoSizer>
    )
  }
}

function getLabel(type) {
  switch (type) {
    case 'REF': return 'Homo Ref'
    case 'HET': return 'Het'
    case 'HOM': return 'Homo Alt'
    default: throw new Error('unreachable')
  }
}

function getDomain(dataList) {
  let min = Infinity
  let max = -Infinity

  dataList.forEach(({ data }) =>
    data.forEach(d => {
      if (d.data < min)
        min = d.data
      if (d.data > max)
        max = d.data
    })
  )

  const delta = max !== min ? max - min : 1

  return [
    min - delta * 0.1,
    max + delta * 0.1,
  ]
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
