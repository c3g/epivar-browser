import {Col, Row} from "reactstrap";
import {useEffect, useState} from "react";
import ManhattanPlot from "./ManhattanPlot";

const ManhattanTest = () => {
  const [chr1RnaSeq, setChr1RnaSeq] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/overview/assays/RNA-seq/topBinned/1");
      const resJSON = await res.json();
      setChr1RnaSeq(resJSON.data);
    })();
  }, []);

  return <div style={{maxWidth: 1110, margin: "auto"}}>
    <ManhattanPlot
      data={chr1RnaSeq ?? []}
      positionProp="pos_bin"
      pValueProp="p_val"
      snpProp="snp_nat_id"
      featureProp="feature_nat_id"
    />
  </div>;
};

export default ManhattanTest;
