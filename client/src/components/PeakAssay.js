import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Col,
  Row,
  Table,
} from 'reactstrap'

import Icon from './Icon'
import AutoSizer from './AutoSizer'
import BoxPlot from './BoxPlot'
import { fetchValues } from '../actions'

const mapStateToProps = state => ({
  valuesByID: state.values.itemsByID
})
const mapDispatchToProps =
  { fetchValues }


class PeakAssay extends Component {
  static getDerivedStateFromProps(props) {
    const p = props.peaks[0]
    return { selectedPeak: p ? p.id : undefined }
  }

  state = {
    selectedPeak: undefined,
  }

  onChangeFeature = (p) => {
    const peakID = p.id

    this.setState({ selectedPeak: peakID })
  }

  render() {
    const { assay, peaks, valuesByID } = this.props
    const { selectedPeak } = this.state
    const p = peaks.find(p => p.id === selectedPeak)
    const values = valuesByID[selectedPeak]

    console.log(selectedPeak, peaks)
    if (!values && p) {
      const params = {
        chrom: p.chrom,
        position: p.position,
      }
      const meta = {
        id: p.id,
      }
      this.props.fetchValues(params, meta)
    }

    return (
      <Container className='PeakAssay'>
        <Row>
          <Col xs='12'>
            <h6 className='PeakAssay__name'>
              <Icon name='flask' className='PeakAssay__icon' /><strong>{assay}</strong> - {peaks.length} peaks
            </h6>
          </Col>
        </Row>
        <Row>
          <Col xs='8'>
            <PeaksTable
              peaks={peaks}
              onChangeFeature={this.onChangeFeature}
            />
          </Col>
          <Col xs='4'>
            <AutoSizer disableHeight>
              {
                ({ width }) =>
                  <BoxPlot
                    title={assay}
                    data={[]}
                    width={width}
                    height={width}
                  />
              }
            </AutoSizer>
          </Col>
        </Row>
      </Container>
    )
  }
}

function PeaksTable({ peaks, onChangeFeature}) {
  return (
    <Table
      className='PeaksTable'
      size='sm'
      bordered
      hover
    >
      <thead>
        <tr>
          <th>Feature</th>
          <th>Condition</th>
          <th>P-value</th>
          <th>Output</th>
        </tr>
      </thead>
      <tbody>
        {
          peaks.map(p =>
            <tr
              key={p.id}
              className='PeaksTable__row'
              role='button'
              onClick={() => onChangeFeature(p)}
            >
              <td className='PeaksTable__feature'>{p.gene || formatFeature(p.feature)}</td>
              <td>{p.condition.split(',').map(conditionName).join(' | ')}</td>
              <td>{p.pvalue.toPrecision(5)}</td>
              <td><a href='#'>Tracks</a></td>
            </tr>
          )
        }
      </tbody>
    </Table>
  )
}

function conditionName(c) {
  switch (c) {
    case 'NI': return 'Non-infected'
    case 'Flu': return 'Flu'
  }
  return 'Unknown'
}

function formatFeature(feature) {
  if (!feature.startsWith('chr'))
    return feature

  const [chrom, start, end] = feature.split('_')
  return `${chrom}:${start}-${end}`
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeakAssay);
