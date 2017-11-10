import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';

import Controls from './Controls.js'

const mapStateToProps = state => ({
    isLoading: state.samples.isLoading
  , samples: state.samples.list
})
const mapDispatchToProps = dispatch =>
  bindActionCreators({ }, dispatch)

class App extends Component {

  render() {
    const { isLoading, samples } = this.props
    const first = samples[0] || {}

    return (
      <div className='App'>

        <Controls />

        <table className='Params'>
        <thead>
          <tr>
            <th>Chrom</th>
            <th>Start</th>
            <th>End</th>
            <th>Reference</th>
            <th>Results</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{ first.chrom }</td>
            <td>{ first.start }</td>
            <td>{ first.end }</td>
            <td>{ first.ref }</td>
            <td>{ samples.length }</td>
          </tr>
        </tbody>
        </table>

        <table className='Samples'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
        {
          samples.map(sample =>
            <tr>
              <td>{ sample.name }</td>
              <td>{ sample.value }</td>
            </tr>
          )
        }
        </tbody>
        </table>

      </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
