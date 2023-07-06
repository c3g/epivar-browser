import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Button,
  ButtonGroup,
  Container,
  Col,
  Input,
  Label,
  Row,
  Table,
  Tooltip,
} from 'reactstrap'
import {useTable, usePagination, useSortBy} from "react-table";

import Icon from "./Icon";
import PeakBoxplot from "./PeakBoxplot";
import {cacheValues, mergeTracks, setUsePrecomputed} from "../actions";


const PAGE_SIZES = [10, 20, 30, 40, 50];


const PeakAssay = ({peaks}) => {
  const dispatch = useDispatch();

  const usePrecomputed = useSelector(state => state.ui.usePrecomputed);
  const setPrecomputed = useCallback(
    event => dispatch(setUsePrecomputed(event.currentTarget.checked)),
    [dispatch]);

  const [selectedPeak, setSelectedPeak] = useState(undefined);

  useEffect(() => {
    if (selectedPeak !== undefined && peaks.map(p => p.id).includes(selectedPeak)) return;
    // If we do not have a selected peak which is in the current list of peaks for all assays, select one.
    const p = peaks[0];
    setSelectedPeak(p ? p.id : undefined);
  }, [peaks])

  const onChangeFeature = useCallback(p => setSelectedPeak(p.id), []);
  const onOpenTracks = useCallback(p => dispatch(mergeTracks(p)), [dispatch]);

  const selectedPeakData = peaks.find(p => p.id === selectedPeak);

  const fetchSome = useCallback((exclude = []) =>
    peaks
      .filter(p => !exclude.includes(p.id))
      .slice(0, 10)
      .forEach(p => {
        dispatch(cacheValues(p, {id: p.id}));
      }),
    [peaks, dispatch]);

  // Fetch some peaks at the start for performance
  useEffect(() => {
    if (selectedPeakData) {
      dispatch(cacheValues(selectedPeakData, {id: selectedPeak}));
      // Give some time for the first one to get priority
      setTimeout(() => fetchSome([selectedPeak]), 100);
    } else {
      fetchSome();
    }
  }, [selectedPeakData, fetchSome]);

  return (
    <Container className='PeakAssay' fluid={true}>
      <Row>
        <Col xs={12}>
          <PeaksTable
            peaks={peaks}
            selectedPeak={selectedPeak}
            onChangeFeature={onChangeFeature}
            onOpenTracks={onOpenTracks}
          />
        </Col>
        <Col xs={12}>
          <Label check={true}>
            <Input type="checkbox" checked={usePrecomputed} onChange={setPrecomputed} />{" "}
            Use precomputed, batch-corrected points?
          </Label>
        </Col>
        <Col xs={12}>
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
  const {id: assembly} = useSelector(state => state.assembly.data) ?? {};
  const conditions = useSelector(state => state.conditions.list);

  const [tooltipsShown, setTooltipsShown] = useState({});

  const toggleTooltip = tooltipID => () => setTooltipsShown({
    ...tooltipsShown,
    [tooltipID]: tooltipsShown[tooltipID] ? undefined : true,
  });

  const columns = useMemo(() => [
    {
      id: "snp",
      Header: "SNP",
      accessor: ({id, snp}) => {
        const k = `row${id}-snp`;
        return <div>
          <a id={k} style={{textDecoration: "underline"}}>{snp.id}</a>
          <Tooltip target={k} placement="top" isOpen={tooltipsShown[k]} toggle={toggleTooltip(k)} autohide={false}>
            [{assembly}] chr{snp.chrom}:{snp.position}
          </Tooltip>
        </div>;
      },
      disableSortBy: true,
    },
    {
      id: "feature",
      Header: "Feature",
      className: "PeaksTable__feature",
      accessor: row => {
        const {id, feature} = row;
        const k = `row${id}-feature`;
        const featureText = formatFeature(row);
        const showTooltip = !featureText.startsWith("chr");
        return <div>
          <a id={k} style={{textDecoration: showTooltip ? "underline" : "none"}}>{featureText}</a>
          {showTooltip ? (
            <Tooltip target={k} placement="top" isOpen={tooltipsShown[k]} toggle={toggleTooltip(k)} autohide={false}>
              [{assembly}] chr{feature.chrom}:{feature.start}-{feature.end}
              {" "}
              {feature.strand ? `(strand: ${feature.strand})` : null}
            </Tooltip>
          ) : null}
        </div>;
      },
      disableSortBy: true,
    },
    {
      id: "distance",
      Header: "SNP-Feature Distance",
      className: "PeaksTable__distance",
      accessor: ({snp: {position: snpPos}, feature: {start, end}}) => {
        if (start <= snpPos && snpPos <= end) {
          return "contained";
        }

        // Otherwise, SNP is outside the feature, either L/R of it.

        // Distance in base pairs
        const distance = Math.min(Math.abs(snpPos - start), Math.abs(snpPos - end));

        return distance > 1000
          ? `${(distance / 1000).toFixed(1)} kb`
          : `${distance.toFixed(0)} bp`;
      },
      disableSortBy: true,
    },
    ...conditions.map(({id, name}, idx) => {
      // noinspection JSUnusedGlobalSymbols
      return {
        id: `value${id}`,
        Header: <span><span style={{fontFamily: "serif"}}>p</span> Value ({name})</span>,
        accessor: row => {
          const fixed = row.values[idx].toPrecision(5);
          const floatStr = row.values[idx].toString();
          return floatStr.length < fixed.length ? floatStr : fixed;
        },
        sortType: (r1, r2, col) => r1.original[col] < r2.original[col] ? -1 : 1,
      };
    }),
    {
      id: "ucsc",
      Header: "View in UCSC",
      className: "PeaksTable__tracks",
      accessor: row => <Button size='sm' color='link' onClick={() => onOpenTracks(row)}>
        Tracks <Icon name='external-link' />
      </Button>,
      disableSortBy: true,
    },
  ], [assembly, conditions, onOpenTracks, tooltipsShown]);

  // noinspection JSCheckFunctionSignatures
  const tableInstance = useTable(
    {columns, data: peaks},
    // Order matters for below hooks
    useSortBy,
    usePagination);

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

  const onGotoPage = useCallback(e => {
    const page = e.target.value ? Number(e.target.value) - 1 : 0
    gotoPage(page)
  }, [gotoPage]);

  const onSelectPage = useCallback(e => setPageSize(Number(e.target.value)), []);

  return <>
    <div className="PeaksTableContainer">
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
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>{column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ''}</span>
                </th>
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
    </div>

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
          onChange={onGotoPage}
          style={{ width: "100px", display: "inline-block" }}
        />
      </div>
      <Input
        type="select"
        value={pageSize}
        onChange={onSelectPage}
        style={{width: "120px", marginLeft: "1em"}}
      >
        {PAGE_SIZES.map(pageSize => (
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
