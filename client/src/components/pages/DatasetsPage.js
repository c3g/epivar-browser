import React, {useCallback} from "react";
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";
import {Col, Container, Row} from "reactstrap";

import {constructUCSCUrl} from "../../helpers/ucsc";
import {useNode} from "../../hooks";


const lgColSize = {size: 10, offset: 1};

const DatasetsPage = () => {
  const node = useNode();
  const {id: assembly} = useSelector(state => state.assembly.data) ?? {};

  const openTracks = useCallback(() => {
    const permaHubURL = `${node}/ucsc/perma/hub/other-tracks`;
    const ucscURL = constructUCSCUrl([
      ["db", assembly],
      ["hubClear", permaHubURL],
    ]);
    console.log("UCSC:", ucscURL);
    window.open(ucscURL);
  }, [assembly]);

  return <Container className="Page">
    <Row>
      <Col md="12" lg={lgColSize}>
        <h2>Datasets</h2>
        <p>
          All the datasets that have been generated as part of this project are made available freely. Access to some
          of the raw datasets will require a formal data access request. Please cite{" "}
          <Link to="/about#papers">the appropriate paper(s)</Link> if you use data from this project.
        </p>
        <h3>Data Download</h3>
        <h4>RNA-seq, ATAC-seq and ChIPmentation</h4>
        <p>
          Sequence data for RNA-seq, ATAC-seq and ChIPmentation have been deposited at the
          European Genome-phenome Archive (EGA), under accession number{" "}
          <a href="https://ega-archive.org/datasets/EGAD00001008422"
             target="_blank"
             rel="noreferrer">EGAD00001008422</a>.
        </p>
        <h4>WGS and WGBS</h4>
        <p>
          Sequence data for WGS and WGBS have been deposited at the European Genome-phenome Archive (EGA), under
          accession number{" "}
          <a href="https://ega-archive.org/datasets/EGAD00001008359"
             target="_blank"
             rel="noreferrer">EGAD00001008359</a>.
        </p>
        {/*<h4>10X linked reads</h4>*/}
        {/*<p>Under submission to EGA.</p>*/}
        <h4>ChIP-seq and ATAC-seq on NA12878</h4>
        <p>
          Sequence data for ChIP-seq and ATAC-seq on NA12878 have been deposited at the Gene Expression Omnibus (GEO),
          under access number{" "}
          <a href="https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE225708"
             target="_blank"
             rel="noreferrer">GSE225708</a>.
        </p>
        <h3>Data visualization</h3>
        <p>
          Genomic tracks by condition and ancestry are available <a href="#" onClick={openTracks}>here</a>.
        </p>
        <p>
          We constructed <Link to="/dataset/overview">a versatile QTL browser</Link>, which allows users to explore and
          visualize mapped QTLs for gene expression, chromatin accessibility, histone modifications and DNA methylation.
        </p>
      </Col>
    </Row>
  </Container>;
};

export default DatasetsPage;
