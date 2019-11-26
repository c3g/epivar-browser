import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Table } from 'reactstrap';

import Header from './Header.js'
import Controls from './Controls.js'
import Charts from './Charts.js'


const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.stats
  , values: state.values
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ }, dispatch)

class App extends Component {

  render() {
    const { isLoading, samples, values } = this.props
    const counts = Object.entries(samples.counts).map(([key, value]) => ({ key: key, count: value }))

    const showParams = !isLoading && samples.total > 0

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
                <td>{ samples.chrom }</td>
                <td>{ samples.start }</td>
                <td>{ samples.end }</td>
                <td>{ samples.ref }</td>
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
