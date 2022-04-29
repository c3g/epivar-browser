import React, {useEffect, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  Button,
  Container,
  Col,
  Row,
  Table, ButtonGroup, Input, Tooltip,
} from 'reactstrap'
import {useTable, usePagination} from "react-table";

import Icon from "./Icon";
import PeakBoxplot from "./PeakBoxplot";
import {cacheValues, mergeTracks} from "../actions";
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

  const fetchSome = (exclude = []) =>
    peaks.filter(p => !exclude.includes(p.id)).slice(0, 10).forEach(p => {
      if (!exclude.includes(p.id)) {
        dispatch(cacheValues(p, {id: p.id}));
      }
    });

  // Fetch some peaks at the start for performance
  useEffect(() => {
    if (selectedPeakData) {
      dispatch(cacheValues(selectedPeakData, {id: selectedPeak}));
      // Give some time for the first one to get priority
      setTimeout(() => fetchSome([selectedPeak]), 100);
    } else {
      fetchSome();
    }
  }, [selectedPeakData]);

  return (
    <Container className='PeakAssay' fluid={true}>
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
            title={selectedPeakData ? `${selectedPeakData.snp.id} — ${formatFeature(selectedPeakData)}` : ""}
            peak={selectedPeakData}
          />
        </Col>
      </Row>
    </Container>
  );
};

const PeaksTable = ({peaks, selectedPeak, onChangeFeature, onOpenTracks}) => {
  const [tooltipsShown, setTooltipsShown] = useState({});

  const toggleTooltip = tooltipID => () => setTooltipsShown({
    ...tooltipsShown,
    [tooltipID]: tooltipsShown[tooltipID] ? undefined : true,
  });

  const columns = useMemo(() => [
    {
      id: "snp",
      Header: "SNP",
      accessor: row => {
        const k = `row${row.id}-snp`;
        return <div>
          <a id={k} style={{textDecoration: "underline"}}>{row.snp.id}</a>
          <Tooltip target={k} placement="top" isOpen={tooltipsShown[k]} toggle={toggleTooltip(k)} autohide={false}>
            [hg19] chr{row.snp.chrom}:{row.snp.position}
          </Tooltip>
        </div>;
      },
    },
    {
      id: "feature",
      Header: "Feature",
      className: "PeaksTable__feature",
      accessor: row => {
        const k = `row${row.id}-feature`;
        const featureText = formatFeature(row);
        const showTooltip = !featureText.startsWith("chr");
        return <div>
          <a id={k} style={{textDecoration: showTooltip ? "underline" : "none"}}>{featureText}</a>
          {showTooltip ? (
            <Tooltip target={k} placement="top" isOpen={tooltipsShown[k]} toggle={toggleTooltip(k)} autohide={false}>
              [hg19] chr{row.feature.chrom}:{row.feature.start}-{row.feature.end}
              {" "}
              {row.feature.strand ? `(strand: ${row.feature.strand})` : null}
            </Tooltip>
          ) : null}
        </div>;
      },
    },
    {
      id: "valueNI",
      Header: <span><span style={{fontFamily: "serif"}}>p</span> Value ({conditionName(CONDITION_NI)})</span>,
      accessor: row => {
        const fixed = row.valueNI.toPrecision(5);
        const floatStr = row.valueNI.toString();
        return floatStr.length < fixed.length ? floatStr : fixed;
      },
    },
    {
      id: "valueFlu",
      Header: <span><span style={{fontFamily: "serif"}}>p</span> Value ({conditionName(CONDITION_FLU)})</span>,
      accessor: row => {
        const fixed = row.valueFlu.toPrecision(5);
        const floatStr = row.valueFlu.toString();
        return floatStr.length < fixed.length ? floatStr : fixed;
      },
    },
    {
      id: "ucsc",
      Header: "View in UCSC",
      className: "PeaksTable__tracks",
      accessor: row => <Button size='sm' color='link' onClick={() => onOpenTracks(row)}>
        Tracks <Icon name='external-link' />
      </Button>,
    },
  ], [onOpenTracks, tooltipsShown]);
  const data = useMemo(() => peaks, []);

  // noinspection JSCheckFunctionSignatures
  const tableInstance = useTable({columns, data}, usePagination);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,

    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = tableInstance;

  return <>
    <Table
      className="PeaksTable"
      size="sm"
      bordered
      hover
      {...getTableProps()}
    >
      <thead>
      {
        headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))
      }
      </thead>
      <tbody {...getTableBodyProps()}>
      {
        page.map(row => {
          prepareRow(row);
          const p = row.original;
          // noinspection JSCheckFunctionSignatures,JSUnresolvedVariable,JSUnusedGlobalSymbols
          return (
            <tr {...row.getRowProps([{
              className: "PeaksTable__row " + (selectedPeak === p.id ? "PeaksTable__row--selected" : ""),
              onClick: () => onChangeFeature(p),
            }])}>
              {row.cells.map(cell => <td {...cell.getCellProps([{
                className: cell.column.className,
              }])}>{cell.render("Cell")}</td>)}
            </tr>
          )
        })
      }
      </tbody>
    </Table>

    {/*
        Pagination can be built however you'd like.
        This is just a very basic UI implementation:
      */}
    <div className="pagination">
      <ButtonGroup>
        <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>&laquo;</Button>
        <Button onClick={() => previousPage()} disabled={!canPreviousPage}>&lsaquo;</Button>
        <Button onClick={() => nextPage()} disabled={!canNextPage}>&rsaquo;</Button>
        <Button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>&raquo;</Button>
      </ButtonGroup>
      <div className="pagination__page">
        Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
      </div>
      <div className="pagination__goto">
        Go to page:{' '}
        <Input
          type="number"
          disabled={pageOptions.length === 1}
          defaultValue={pageIndex + 1}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0
            gotoPage(page)
          }}
          style={{ width: "100px", display: "inline-block" }}
        />
      </div>
      <Input
        type="select"
        value={pageSize}
        onChange={e => setPageSize(Number(e.target.value))}
        style={{width: "120px", marginLeft: "1em"}}
      >
        {[10, 20, 30, 40, 50].map(pageSize => (
          <option key={pageSize} value={pageSize}>
            Show {pageSize}
          </option>
        ))}
      </Input>
    </div>
  </>;
}

function formatFeature({assay, gene, feature}) {
  const {chrom, start, end, strand} = feature;
  const featureText = `chr${chrom}:${start}-${end}` + (strand ? ` (${strand})` : '')
  return assay === "RNA-seq" ? (gene || featureText) : featureText
}

export default PeakAssay;
