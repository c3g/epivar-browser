import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
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
import {CONDITION_FLU, CONDITION_NI, conditionName} from "../helpers/conditions";


const PeakAssay = ({peaks}) => {
  const dispatch = useDispatch();
  // noinspection JSUnresolvedVariable
  const valuesByID = useSelector(state => state.values.itemsByID);

  const [selectedPeak, setSelectedPeak] = useState(undefined);

  useEffect(() => {
    if (selectedPeak !== undefined) return;
    const p = peaks[0];
    setSelectedPeak(p ? p.id : undefined);
  }, [peaks])

  const onChangeFeature = p => setSelectedPeak(p.id);
  const onOpenTracks = p => dispatch(mergeTracks(p));

  const selectedPeakData = peaks.find(p => p.id === selectedPeak);
  const selectedPeakValues = valuesByID[selectedPeak];

  const fetchAll = (exclude = []) =>
    peaks.forEach(p => {
      if (!valuesByID[p.id] && !exclude.includes(p.id)) {
        dispatch(fetchValues(p, {id: p.id}));
      }
    });

  useEffect(() => {
    if (!selectedPeakValues && selectedPeakData) {
      dispatch(fetchValues(selectedPeakData, {id: selectedPeak}));
      // Give some time for the first one to get priority
      setTimeout(() => fetchAll([selectedPeak]), 100);
    } else {
      fetchAll();
    }
  }, [selectedPeakData, selectedPeakValues])

  return (
    <Container className='PeakAssay'>
      <Row>
        <Col xs='12'>
          <PeaksTable
            peaks={peaks}
            selectedPeak={selectedPeak}
            onChangeFeature={onChangeFeature}
            onOpenTracks={onOpenTracks}
          />
          {selectedPeakValues && selectedPeakValues.message &&
            <Alert color='danger'>
              <strong>Error while fetching data:</strong> {selectedPeakValues.message}
            </Alert>
          }
        </Col>
        <Col xs='12' className={selectedPeakValues && selectedPeakValues.isLoading ? 'loading' : ''}>
          <PeakBoxplot
            title={selectedPeakData ? formatFeature(selectedPeakData) : ""}
            peak={selectedPeakData}
            values={selectedPeakValues}
          />
        </Col>
      </Row>
    </Container>
  );
};


const PeaksTable = ({peaks, selectedPeak, onChangeFeature, onOpenTracks}) => (
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
        <th>FDR ({conditionName(CONDITION_NI)})</th>
        <th>FDR ({conditionName(CONDITION_FLU)})</th>
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

function formatFeature({assay, gene, feature}) {
  const {chrom, start, end, strand} = feature
  const featureText = `${chrom}:${start}-${end}` + (strand ? ` (${strand})` : '')
  return assay === "RNA-seq" ? (gene || featureText) : featureText
}

export default PeakAssay;
