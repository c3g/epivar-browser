import {useCallback, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

import {Input} from "reactstrap";

import ManhattanPlot from "../ManhattanPlot";

import {
  doSearch,
  setPosition,
  fetchOverviewConfig,
  fetchManhattanData,
  setOverviewChrom,
  setOverviewAssay,
} from '../../actions.js'

const SNP_PROP = "snp_nat_id";

const useWindowDimensions = () => {
  const {innerWidth: width, innerHeight: height} = window;
  return {width, height};
};

const PLOT_MIN_WIDTH = 600;
const PLOT_MAX_WIDTH = 1110;

const OverviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {width} = useWindowDimensions();

  const {
    isLoading: configIsLoading,
    isLoaded: configIsLoaded,
    config,
  } = useSelector(state => state.overview);
  const binSizeKb = ((config.binSize ?? 0) / 1000).toFixed(0);

  const chroms = useMemo(() => Object.keys(config.chromosomeSizes ?? {}), [config]);
  const {
    isLoading: assaysIsLoading,
    isLoaded: assaysIsLoaded,
    list: assays,
  } = useSelector(state => state.assays);

  const {chrom, assay} = useSelector(state => state.ui.overview);

  const setChrom = useCallback((chrom) => dispatch(setOverviewChrom(chrom)), [dispatch]);
  const setAssay = useCallback((assay) => dispatch(setOverviewAssay(assay)), [dispatch]);

  useEffect(() => {
    if (!configIsLoading && !configIsLoaded) {
      dispatch(fetchOverviewConfig());
    }
    if (chroms.length && chrom === "") {
      setChrom(chroms[0]);
    }
    if (assays.length && assay === "") {
      setAssay(assays[0]);
    }
  }, [configIsLoading, configIsLoaded, chroms, chrom, assays, assay, setChrom, setAssay]);

  const binnedDataByChromAndAssay = useSelector(state => state.manhattan.byChromAndAssay);
  const assayRecord = useMemo(
    () => binnedDataByChromAndAssay[chrom]?.[assay],
    [binnedDataByChromAndAssay, chrom, assay]);

  useEffect(() => {
    if (!assaysIsLoaded || chrom === "" || assay === "") return;
    if (assayRecord?.isLoading || assayRecord?.isLoaded) return;
    const params = {chrom, assay};
    dispatch(fetchManhattanData(params, params)).catch(console.error);
  }, [dispatch, assaysIsLoaded, assays, chrom, assay, assayRecord]);

  // noinspection JSValidateTypes
  return <div className="Page">
    <div style={{maxWidth: PLOT_MAX_WIDTH, margin: "auto"}}
         className={"Overview" + (assaysIsLoading ? " loading" : "")}>
      <div style={{
        display: "flex",
        gap: 12,
        flexDirection: "row",
        alignItems: "baseline",
        padding: "0 12px",
      }}>
        <label htmlFor="Manhattan__chrom-selector">Chromosome:</label>
        <Input
          type="select"
          name="Manhattan__chrom-selector"
          id="Manhattan__chrom-selector"
          value={chrom}
          onChange={e => setChrom(e.target.value)}
        >
          {chrom === "" && <option value=""></option>}
          {chroms.map(chr => <option key={chr} value={chr}>chr{chr}</option>)}
        </Input>
        <div style={{width: 1, height: 38, backgroundColor: "#DDD"}} /> {/* Additional divider */}
        <label htmlFor="Manhattan__assay-selector">Assay:</label>
        <Input
          type="select"
          name="Manhattan__assay-selector"
          id="Manhattan__assay-selector"
          value={assay}
          onChange={e => setAssay(e.target.value)}
        >
          {assay === "" && <option value=""></option>}
          {assays.map(a => <option key={a} value={a}>{a}</option>)}
        </Input>
      </div>

      {(chrom !== "" && assay !== "") &&
        <ManhattanPlot
          width={Math.min(Math.max(PLOT_MIN_WIDTH, width), PLOT_MAX_WIDTH)}
          height={275}
          title={`chr${chrom} ${assay}: Most significant peaks by SNP position (${binSizeKb}kb bins)`}
          data={assayRecord?.data ?? []}
          positionProp="pos_bin"
          pValueProp="p_val"
          snpProp={SNP_PROP}
          featureProp="feature_nat_id"
          geneProp="gene_name"
          onPointClick={peak => {
            if (!dispatch) return;
            const snp = peak[SNP_PROP];
            navigate(`/explore/locus/rsID/${snp}/${assay}`);
            dispatch(setChrom("rsID"));
            dispatch(setPosition(snp));
            dispatch(doSearch());
          }}
          className={assayRecord?.isLoading ? 'loading' : ''}
        />
      }
    </div>
  </div>;
};

export default OverviewPage;