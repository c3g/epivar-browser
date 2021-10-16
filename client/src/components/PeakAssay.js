import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  Button,
  Container,
  Col,
  Row,
  Table,
} from 'reactstrap'

import Icon from './Icon'
import PeakBoxplot from './PeakBoxplot'
import { fetchValues, mergeTracks } from '../actions'

const mapStateToProps = state => ({
  valuesByID: state.values.itemsByID
})
const mapDispatchToProps =
  { fetchValues, mergeTracks }


class PeakAssay extends Component {
  static getDerivedStateFromProps(props, state) {
    if (state.selectedPeak !== undefined)
      return null
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

  onOpenTracks = (p) => {
    this.props.mergeTracks(p)
  }

  render() {
    const { peaks, valuesByID } = this.props
    const { selectedPeak } = this.state
    const selectedPeakData = peaks.find(p => p.id === selectedPeak)
    const selectedPeakValues = valuesByID[selectedPeak]

    // Pre-fetch all peak values - fire off a bunch of promises without waiting
    const fetchAll = (exclude = []) =>
      peaks.forEach(p => {
        if (!valuesByID[p.id] && !exclude.includes(p.id)) {
          this.props.fetchValues(p, {id: p.id})
        }
      })

    // Fire the selected peak request first
    if (!selectedPeakValues && selectedPeakData) {
      this.props.fetchValues(selectedPeakData, {id: selectedPeak})
      // Give some time for the first one to get priority
      setTimeout(() => fetchAll([selectedPeak]), 100)
    } else {
      fetchAll()
    }

    return (
      <Container className='PeakAssay'>
        <Row>
          <Col xs='12'>
            <PeaksTable
              peaks={peaks}
              selectedPeak={selectedPeak}
              onChangeFeature={this.onChangeFeature}
              onOpenTracks={this.onOpenTracks}
            />
            {selectedPeakValues && selectedPeakValues.message &&
              <Alert color='danger'>
                <strong>Error while fetching data:</strong> {selectedPeakValues.message}
              </Alert>
            }
          </Col>
          <Col xs='12' className={selectedPeakValues && selectedPeakValues.isLoading ? 'loading' : ''}>
            <PeakBoxplot
              title={formatFeature(selectedPeakData)}
              values={selectedPeakValues}
            />
          </Col>
        </Row>
      </Container>
    )
  }
}

function PeaksTable({ peaks, selectedPeak, onChangeFeature, onOpenTracks}) {
  return (
    <Table
      className='PeaksTable'
      size='sm'
      bordered
      hover
    >
      <thead>
        <tr>
          <th>rsID</th>
          <th>Feature</th>
          <th>FDR (NI)</th>
          <th>FDR (Flu)</th>
          <th>View in UCSC</th>
        </tr>
      </thead>
      <tbody>
        {
          peaks.map(p =>
            <tr
              key={p.id}
              className={'PeaksTable__row ' + (selectedPeak === p.id ? 'PeaksTable__row--selected' : '')}
              role='button'
              onClick={() => onChangeFeature(p)}
            >
              <td>{p.rsID}</td>
              <td className='PeaksTable__feature'>{formatFeature(p)}</td>
              <td>{p.valueNI.toPrecision(5)}</td>
              <td>{p.valueFlu.toPrecision(5)}</td>
              <td className='PeaksTable__tracks'>
                <Button size='sm' color='link' onClick={() => onOpenTracks(p)}>
                  Tracks <Icon name='external-link' />
                </Button>
              </td>
            </tr>
          )
        }
      </tbody>
    </Table>
  )
}

function conditionName(c) {
  switch (c) {
    case 'NI':  return 'Non-infected'
    case 'Flu': return 'Flu'
    default:
      return 'Unknown'
  }
}

function formatFeature({gene, feature}) {
  const {chrom, start, end, strand} = feature
  return gene || `${chrom}:${start}-${end}` + (strand ? ` (${strand})` : '')
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PeakAssay);
