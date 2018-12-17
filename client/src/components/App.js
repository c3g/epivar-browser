import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Container, Table, Col, Row } from 'reactstrap';
import { groupBy, prop } from 'ramda';

import Header from './Header.js'
import Controls from './Controls.js'
import Charts from './Charts.js'

const groupByValue = groupBy(prop('value'))
const getCounts = samples => {
  const samplesByValue = groupByValue(samples)
  const values = Object.keys(samplesByValue)
  return values.map(value => ({ key: value, count: Object.values(samplesByValue[value]).length }))
}


const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.list
  , values: state.values
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ }, dispatch)

class App extends Component {

  render() {
    const { isLoading, samples, values } = this.props
    const first = samples[0] || {}
    const counts = getCounts(samples)

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
                    <th>{key}</th>
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
                  counts.map(({count}) =>
                    <th>{count}</th>
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
