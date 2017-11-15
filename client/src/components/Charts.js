import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Container, Table, Col, Row } from 'reactstrap';

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

    return (
      <AutoSizer disableHeight>
        {
          ({ width }) =>
            Object.entries(values.map).map(([assay, valuesByType]) =>
              <BoxPlot title={assay}
                data={Object.entries(valuesByType).map(([name, data]) => ({ name, data }))}
                width={width}
                height={300}
                padding={30}
                domain={getDomain(valuesByType)}
              />
            )
        }
      </AutoSizer>
    )
  }
}

function getDomain(dataMap) {
  let min = Infinity
  let max = -Infinity

  Object.values(dataMap).forEach(data =>
    data.forEach(d => {
      if (d.data < min)
        min = d.data
      if (d.data > max)
        max = d.data
    })
  )

  const delta = max - min

  return [
    min - delta * 0.1,
    max + delta * 0.1,
  ]
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Charts);
