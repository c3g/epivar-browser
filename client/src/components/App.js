import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

import Header from './Header.js'
import Controls from './Controls.js'
import Charts from './Charts.js'

const getCounts = (total, samples) => {
  const types = {
    REF: 0,
    HET: 0,
    HOM: 0,
  }
  samples.forEach(sample => {
    if (sample.value === `${sample.alt}|${sample.alt}`)
      types.HOM += 1
    else
      types.HET += 1
  })
  types.REF = total - types.HET - types.HOM

  return Object.entries(types).map(([key, value]) => ({ key: key, count: value }))
}


const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , total: state.samples.total
  , samples: state.samples.list
  , values: state.values
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ }, dispatch)

class App extends Component {

  render() {
    const { isLoading, total, samples, values } = this.props
    const first = samples[0] || {}
    const counts = getCounts(total, samples)

    const showParams = !isLoading && samples.length > 0

    return (
      <div className='App'>

        <Header>
          <Controls />

          <Table className={ 'Params ' + ( showParams ? 'visible' : '' ) }>
            <thead>
              <tr>
                <th>Chrom</th>
                <th>Start</th>
                <th>End</th>
                <th>Reference</th>
                {
                  counts.map(({key}) =>
                    <th key={key}>{key}</th>
                  )
                }
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{ first.chrom }</td>
                <td>{ first.start }</td>
                <td>{ first.end }</td>
                <td>{ first.ref }</td>
                {
                  counts.map(({key, count}) =>
                    <th key={key}>{count}</th>
                  )
                }
              </tr>
            </tbody>
          </Table>

        </Header>

        <Charts />

    </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
