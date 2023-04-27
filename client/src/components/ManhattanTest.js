import {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

import ManhattanPlot from "./ManhattanPlot";

import {
  setChrom,
  doSearch,
  setPosition,
} from '../actions.js'

const SNP_PROP = "snp_nat_id";

const ManhattanTest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const assay = "RNA-seq";

  const [chr1RnaSeq, setChr1RnaSeq] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/overview/assays/${assay}/topBinned/1`);
      const resJSON = await res.json();
      setChr1RnaSeq(resJSON.data);
    })();
  }, []);

  return <div style={{maxWidth: 1110, margin: "auto"}}>
    <ManhattanPlot
      data={chr1RnaSeq ?? []}
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
  </div>;
};

export default ManhattanTest;
