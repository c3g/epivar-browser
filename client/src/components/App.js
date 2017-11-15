import React, { Component } from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import { Container, Table, Col, Row } from 'reactstrap';

import Header from './Header.js'
import Controls from './Controls.js'
import AutoSizer from './AutoSizer.js'
import BoxPlot from './BoxPlot.js'

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
          </Table>

        </Header>

        <Container>
          <Row>
            <Col sm='6'>
              <Table className='Samples' bordered>
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
              </Table>
            </Col>
            <Col sm='6'>
              { values.isLoading && 'loading' }
              <AutoSizer disableHeight>
                {
                  ({ width }) =>
                    Object.entries(values.map).map(([assay, valuesByType]) =>
                      <BoxPlot title={'H3K27me3'}
                        data={Object.entries(valuesByType).map(([name, data]) => ({ name, data }))}
                        width={width}
                        height={300}
                        padding={30}
                        domain={[0, 5]}
                      />
                    )
                }
              </AutoSizer>
            </Col>
          </Row>
        </Container>

    </div>
    )
  }
}


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
