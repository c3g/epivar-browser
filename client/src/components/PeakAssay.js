import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Button,
  ButtonGroup,
  Container,
  Col,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Table,
  Tooltip,
} from 'reactstrap'
import {useTable, usePagination, useSortBy} from "react-table";
import igv from "igv/dist/igv.esm";

import Icon from "./Icon";
import PeakBoxplot from "./PeakBoxplot";

import {mergeTracks, setUsePrecomputed} from "../actions";
import {BASE_URL} from "../constants/app";
import {constructUCSCUrl} from "../helpers/ucsc";


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
  const onOpenTracks = useCallback((p) => {
    return dispatch(mergeTracks(p));  // res shape: { assemblyID, sessionID, session }
  }, [dispatch]);

  const selectedPeakData = peaks.find(p => p.id === selectedPeak);

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
  const devMode = useSelector(state => state.ui.devMode);
  const {id: assembly} = useSelector(state => state.assembly.data) ?? {};
  const conditions = useSelector(state => state.conditions.list);

  const [tooltipsShown, setTooltipsShown] = useState({});
  const [tracksLoading, setTracksLoading] = useState({});

  const [igvData, setIgvData] = useState(null);  // shape: { assemblyID, sessionID, session }
  const [igvModalOpen, setIgvModalOpen] = useState(false);

  const setTrackLoading = useCallback((id) => {
    setTracksLoading({...tracksLoading, [id]: true});
  }, [tracksLoading]);
  const setTrackNotLoading = useCallback((id) => {
    setTracksLoading(Object.fromEntries(Object.entries(tracksLoading).filter(e => e[0] !== id)));
  }, [tracksLoading]);

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
      id: "tracks",
      Header: "View Tracks",
      className: "PeaksTable__tracks",
      accessor: row => {
        const loading = tracksLoading[row.id];
        return <div style={{ whiteSpace: "nowrap" }}>
          {devMode && <>
            <Button size="sm" color="link" disabled={loading} onClick={() => {
              setTrackLoading(row.id);
              onOpenTracks(row).then((res) => {
                console.debug("opening igv.js with", res);
                setIgvData(res);
                setTrackNotLoading(row.id);
                setIgvModalOpen(true);
              });
            }}>
              <span style={{ fontFamily: "monospace" }}>igv.js</span>
            </Button>
            <span style={{ margin: "0 0.5em" }}>·</span>
          </>}
          <Button size='sm' color='link' disabled={loading} onClick={() => {
            setTrackLoading(row.id);
            onOpenTracks(row).then((res) => {
              launchInUCSC(res);
              setTrackNotLoading(row.id);
            });
          }}>
            UCSC <Icon name='external-link' />
          </Button>
        </div>;
      },
      disableSortBy: true,
    },
  ], [assembly, conditions, setTrackLoading, setTrackNotLoading, onOpenTracks, tooltipsShown, devMode]);

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
      <PeakIGVModal data={igvData} isOpen={igvModalOpen} toggle={() => setIgvModalOpen(!igvModalOpen)} />

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

const PeakIGVModal = ({ data, isOpen, toggle }) => {
  const browserDiv = useRef();
  const browserRef = useRef(null);

  const [loadingBrowser, setLoadingBrowser] = useState(false);
  const [sessionTracks, setSessionTracks] = useState(null);

  const { assemblyID, sessionID, session: { assay, feature, snp } } = data ?? { session: {} };
  const { chrom: fChrom, start: fStart, end: fEnd } = feature ?? {};

  useEffect(() => {
    // Fetch tracks when data is set
    if (data) {
      setLoadingBrowser(true);
      fetch(`${BASE_URL}/api/igvjs/track-db/${sessionID}`)
        .then((res) => res.json())
        .then(({data: tracks}) => {
          setSessionTracks(tracks);
        })
        .catch((err) => console.error(err));
    } else if (browserRef.current) {
      igv.removeBrowser(browserRef.current);
    }
  }, [data]);

  useEffect(() => {
    console.debug("browserDiv.current:", browserDiv.current);
    console.debug("tracks:", sessionTracks);
    
    if (!browserDiv.current || !sessionTracks) return;
    
    igv.createBrowser(browserDiv.current, {
      genome: assemblyID,
      locus: buildBrowserPosition(feature, snp),
      tracks: data,
      roi: [
        buildIGVjsROI(`chr${fChrom}`, fStart, fEnd, FEATURE_HIGHLIGHT_COLOR, "Feature"),
        buildIGVjsROI(`chr${snp.chrom}`, snp.position, snp.position + 1, SNP_HIGHLIGHT_COLOR, "SNP"),
      ],
    }).then((browser) => {
      console.debug("set up igv.js browser:", browser);
      browserRef.current = browser;
      setLoadingBrowser(false);
    }).catch((err) => console.error(err));
  }, [sessionTracks]);

  const title = data ? `IGV.js browser – ${assay}; SNP: ${snp.id}, feature: chr${fChrom}:${fStart}-${fEnd}` : "";

  return (
    <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "80vw" }}>
      <ModalHeader toggle={toggle}>{title}</ModalHeader>
      <ModalBody>
        {loadingBrowser && <span>Loading...</span>}
        <div ref={browserDiv} style={{ minHeight: 700 }} />
      </ModalBody>
    </Modal>
  );
};

const launchInUCSC = ({ assemblyID, sessionID, session: { feature, snp } }) => {
  const position = buildBrowserPosition(feature, snp);
  const hubURL = `${BASE_URL}/api/ucsc/hub/${sessionID}`;
  const ucscURL = constructUCSCUrl([
    ["db", assemblyID],
    ["hubClear", hubURL],
    // ["hubClear", permaHubURL],
    ["position", position],

    // Highlight the SNP in red, and the feature in light yellow
    ["highlight", [
      buildUCSCHighlight(assemblyID, `chr${feature.chrom}`, feature.start, feature.end, FEATURE_HIGHLIGHT_COLOR),
      buildUCSCHighlight(assemblyID, `chr${snp.chrom}`, snp.position, snp.position + 1, SNP_HIGHLIGHT_COLOR),
    ].join("|")],
  ]);

  console.debug('Hub:',  hubURL);
  console.debug('UCSC:', ucscURL);

  window.open(ucscURL);
};

const buildBrowserPosition = (feature, snp, padding=500) => {
  const featureChrom = `chr${feature.chrom}`;
  const snpChrom = `chr${snp.chrom}`;

  const snpPosition = snp.position;
  const displayWindow = featureChrom === snpChrom
    ? [Math.min(feature.start, snpPosition), Math.max(feature.end, snpPosition)]
    : [feature.start, feature.end];

  return `${featureChrom}:${displayWindow[0]-padding}-${displayWindow[1]+padding}`;
};

const FEATURE_HIGHLIGHT_COLOR = "#FFEECC";
const SNP_HIGHLIGHT_COLOR = "#FF9F9F";

const buildIGVjsROI = (chr, start, end, color, name) => ({
  name,
  color,
  features: [{ chr, start, end }],
});

const buildUCSCHighlight = (asm, chr, start, end, color) => `${asm}.${chr}:${start}-${end}${color}`;

const formatFeature = ({assay, gene, feature}) => {
  const {chrom, start, end, strand} = feature;
  const featureText = `chr${chrom}:${start}-${end}` + (strand ? ` (${strand})` : '')
  return assay === "RNA-seq" ? (gene || featureText) : featureText
};

export default PeakAssay;
