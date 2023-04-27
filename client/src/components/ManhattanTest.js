import {useEffect, useState} from "react";
import ManhattanPlot from "./ManhattanPlot";
import {useNavigate} from "react-router-dom";

const SNP_PROP = "snp_nat_id";

const ManhattanTest = () => {
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
        navigate(`/explore/locus/rsID/${peak[SNP_PROP]}/${assay}`);
      }}
    />
  </div>;
};

export default ManhattanTest;
