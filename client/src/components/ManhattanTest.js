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

  const [binnedDataByChromAndAssay, setBinnedDataByChromAndAssay] = useState({});
  const [attemptedLoadingBinnedData, setAttemptedLoadingBinnedData] = useState(false);

  useEffect(() => {
    if (!assaysIsLoaded || !selectedChrom) return;

    (async () => {
      await Promise.all(assays.map((assay => (async (a) => {
        // If already loaded, don't load again
        if ((binnedDataByChromAndAssay[selectedChrom]?.[a] ?? []).length > 0) return;

        const res = await fetch(`/api/overview/assays/${a}/topBinned/${selectedChrom}`);
        const resJSON = await res.json();
        setBinnedDataByChromAndAssay({
          ...binnedDataByChromAndAssay,
          [selectedChrom]: {
            ...(binnedDataByChromAndAssay[selectedChrom] ?? {}),
            [a]: resJSON.data,
          },
        });
      })(assay)))).catch(console.error);

      setAttemptedLoadingBinnedData(true);
    })();
  }, [assaysIsLoaded, assays, selectedChrom]);

  const isLoading = assaysIsLoading || !attemptedLoadingBinnedData;  // TODO: more terms

  // noinspection JSValidateTypes
  return <div style={{maxWidth: 1110, margin: "auto", paddingTop: 16}}
              className={"Overview" + (isLoading ? " loading" : "")}>
    <div style={{display: "flex", gap: 12, flexDirection: "row"}}>
      <label htmlFor="Manhattan__chrom-selector">Chromosome:</label>
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

    {(selectedChrom !== "") && assays.map(assay => (
      <ManhattanPlot
        key={assay}
        title={`chr${selectedChrom} ${assay}: Most significant peaks by SNP position (${binSizeKb}kb bins)`}
        data={binnedDataByChromAndAssay[selectedChrom]?.[assay] ?? []}
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
      />
    ))}
  </div>;
};

export default ManhattanTest;
