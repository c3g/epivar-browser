import {Col, Row} from "reactstrap";
import {useEffect, useState} from "react";
import ManhattanPlot from "./ManhattanPlot";

const ManhattanTest = () => {
  const [chr1RnaSeq, setChr1RnaSeq] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/overview/assays/RNA-seq/topBinned/1");
      const resJSON = await res.json();
      setChr1RnaSeq(resJSON);
    })();
  }, []);

  return <Row>
    <Col md="12" lg={{size: 10, offset: 1}}>
      <ManhattanPlot data={chr1RnaSeq} positionProp="pos_bin" pValueProp="p_val" />
    </Col>
  </Row>;
};

export default ManhattanTest;
