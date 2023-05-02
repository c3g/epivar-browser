import {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";

import {Input} from "reactstrap";

import ManhattanPlot from "./ManhattanPlot";

import {
  setChrom,
  doSearch,
  setPosition,
  fetchOverviewConfig,
  fetchManhattanData,
} from '../actions.js'

const SNP_PROP = "snp_nat_id";

const ManhattanTest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    isLoading: configIsLoading,
    isLoaded: configIsLoaded,
    config,
  } = useSelector(state => state.overview);

  const binSizeKb = ((config.binSize ?? 0) / 1000).toFixed(0);

  const chroms = useMemo(() => Object.keys(config.chromosomeSizes ?? {}), [config]);
  const [selectedChrom, setSelectedChrom] = useState("")

  useEffect(() => {
    if (!configIsLoading && !configIsLoaded) {
      dispatch(fetchOverviewConfig());
    }
    if (chroms.length && selectedChrom === "") {
      setSelectedChrom(chroms[0]);
    }
  }, [configIsLoading, configIsLoaded, chroms, selectedChrom]);

  const {
    isLoading: assaysIsLoading,
    isLoaded: assaysIsLoaded,
    list: assays,
  } = useSelector(state => state.assays);

  const binnedDataByChromAndAssay = useSelector(state => state.manhattan.byChromAndAssay);

  useEffect(() => {
    if (!assaysIsLoaded || !selectedChrom) return;

    (async () => {
      await Promise.all(assays
        .filter(assay => !binnedDataByChromAndAssay[selectedChrom]?.[assay]?.isLoaded)
        .map(assay => {
          const params = {chrom: selectedChrom, assay};
          return dispatch(fetchManhattanData(params, params));
        }));
    })();
  }, [assaysIsLoaded, assays, selectedChrom]);

  // noinspection JSValidateTypes
  return <div style={{maxWidth: 1110, margin: "auto", paddingTop: 24}}
              className={"Overview" + (assaysIsLoading ? " loading" : "")}>
    <div style={{
      display: "flex",
      gap: 12,
      flexDirection: "row",
      alignItems: "baseline",
      maxWidth: 560,
      margin: "auto",
    }}>
      <label htmlFor="Manhattan__chrom-selector">Plot chromosome:</label>
      <Input
        type="select"
        name="Manhattan__chrom-selector"
        id="Manhattan__chrom-selector"
        value={selectedChrom}
        onChange={e => setSelectedChrom(e.target.value)}
      >
        <option value=""></option>
        {chroms.map(chr => <option key={chr} value={chr}>chr{chr}</option>)}
      </Input>
    </div>

    {(selectedChrom !== "") && assays.map(assay => {
      const assayRecord = binnedDataByChromAndAssay[selectedChrom]?.[assay];
      return <ManhattanPlot
        key={assay}
        width={1110}
        height={275}
        title={`chr${selectedChrom} ${assay}: Most significant peaks by SNP position (${binSizeKb}kb bins)`}
        data={assayRecord?.data ?? []}
        group="overview"
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
      />;
    })}
  </div>;
};

export default ManhattanTest;
