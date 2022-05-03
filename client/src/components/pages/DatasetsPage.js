import React from "react";
import {Col, Container, Row} from "reactstrap";
import {Link} from "react-router-dom";

const DatasetsPage = () => {
  return <Container className="Page">
    <Row>
      <Col md="12" lg={{size: 10, offset: 1}}>
        <h2>Datasets</h2>
        <p>
          All the datasets that have been generated as part of this project are made available freely. Access to some
          of the raw datasets will require a formal data access request. Please cite{" "}
          <Link to="/about#papers">the appropriate paper(s)</Link> if you use data from this project.
        </p>
      </Col>
    </Row>
    <Row>
      <Col sm="12" md="6" lg={{size: 5, offset: 1}}>
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
        <h4>10X linked reads</h4>
        <p>N/A for now</p>
        <h4>ChIP-seq on NA12878</h4>
        <p>N/A for now</p>
      </Col>
      <Col sm="12" md="6" lg="5">
        <h3>Data visualization</h3>
        <p>
          We constructed <Link to="/explore">a versatile QTL browser</Link>, which allows users to explore and visualize
          mapped QTLs for gene expression, chromatin accessibility, histone modifications and DNA methylation.
        </p>
        <p>
          To generate plots, we use the UCSC <em>bigWigSummary</em> tool to calculate average signal across a feature
          for each sample upon request. These values are combined with genotype information extracted from a{" "}
          <a href="https://gemini.readthedocs.io/en/latest/"
             target="_blank"
             rel="noreferrer">Gemini database</a> into a box plot on a server, which is
          then sent to the user’s browser if they have signed in and agreed to the terms of use. Plots are generated as
          needed, rather than in advance, and are derived directly from the track and genotype data.
        </p>
        <p>
          Genome browser tracks were created with the HOMER <em>makeUCSCfile</em> command and <em>bedGraphToBigWig</em>
          {" "}utility from UCSC. Tracks were normalized so that each value represents the read count per base pair per
          10 million reads.  We generate{" "}
          <a href="https://genome.ucsc.edu/"
             target="_blank"
             rel="noreferrer">UCSC Genome Browser</a> track hubs upon
          request to visualize averaged track segments for a given genomic feature. These tracks are created on the fly
          by averaging bigWig regions of samples sharing an experimental treatment and genotype.
        </p>
      </Col>
    </Row>
  </Container>;
};

export default DatasetsPage;
