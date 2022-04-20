import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  Button,
  Container,
  Col,
  Row,
  Table,
} from 'reactstrap'

import Icon from './Icon'
import PeakBoxplot from './PeakBoxplot'
import { cacheValues, mergeTracks } from '../actions'
import {CONDITION_FLU, CONDITION_NI, conditionName} from "../helpers/conditions";


const PeakAssay = ({peaks}) => {
  const dispatch = useDispatch();

  const [selectedPeak, setSelectedPeak] = useState(undefined);

  useEffect(() => {
    if (selectedPeak !== undefined) return;
    const p = peaks[0];
    setSelectedPeak(p ? p.id : undefined);
  }, [peaks])

  const onChangeFeature = p => setSelectedPeak(p.id);
  const onOpenTracks = p => dispatch(mergeTracks(p));

  const selectedPeakData = peaks.find(p => p.id === selectedPeak);

  const fetchAll = (exclude = []) =>
    peaks.forEach(p => {
      if (!exclude.includes(p.id)) {
        dispatch(cacheValues(p, {id: p.id}));
      }
    });

  useEffect(() => {
    if (selectedPeakData) {
      dispatch(cacheValues(selectedPeakData, {id: selectedPeak}));
      // Give some time for the first one to get priority
      setTimeout(() => fetchAll([selectedPeak]), 100);
    } else {
      fetchAll();
    }
  }, [selectedPeakData])

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
        </Col>
        <Col xs='12'>
          <PeakBoxplot
            title={selectedPeakData ? formatFeature(selectedPeakData) : ""}
            peak={selectedPeakData}
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
        <th>SNP</th>
        <th>Feature</th>
        <th><span style={{fontFamily: "serif"}}>p</span> Value ({conditionName(CONDITION_NI)})</th>
        <th><span style={{fontFamily: "serif"}}>p</span> Value ({conditionName(CONDITION_FLU)})</th>
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
            <td>{p.snp}</td>
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

function formatFeature({assay, gene, chrom, start, end, strand}) {
  // chrom, start, end, strand are associated with the feature;
  // position (unused here) is associated with the SNP
  const featureText = `chr${chrom}:${start}-${end}` + (strand ? ` (${strand})` : '')
  return assay === "RNA-seq" ? (gene || featureText) : featureText
}

export default PeakAssay;
