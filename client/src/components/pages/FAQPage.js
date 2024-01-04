import {Col, Container, Row} from "reactstrap";

const FAQPage = () => {
  return <Container className="Page">
    <Row>
      <Col md="12" lg={{size: 10, offset: 1}}>
        <h2>FAQ</h2>
        <details open={true}>
          <summary>How are the QTL plots generated?</summary>
          <p>
            To generate plots, we either use pre-computed, batch-corrected and normalized sample-wise signal matrices,
            or use the UCSC <em>bigWigSummary</em> tool to calculate average signal across a feature for each sample
            upon request. These values are combined with genotype information, extracted from a VCF file, to create a
            box plot on a server, which is then sent to the user’s browser if they have agreed to the terms of use.
            Plots are generated as needed, rather than in advance, and are derived directly from the matrix or track and
            genotype data.
          </p>
        </details>
        <details open={true}>
          <summary>How were the genomic tracks grouped by genotype generated?</summary>
          <p>
            We generate{" "}
            <a href="https://genome.ucsc.edu/"
               target="_blank"
               rel="noreferrer">UCSC Genome Browser</a> track hubs or{" "}
            <a href="https://github.com/igvteam/igv.js/wiki" target="_blank" rel="noreferrer">IGV.js</a>{" "}
            browser instances upon request to visualize averaged normalized track segments for a given genomic feature.
            These averaged tracks are created on the fly by averaging bigWig regions of samples sharing an experimental
            treatment and genotype, using our command-line tool:{" "}
            <a href="https://github.com/c3g/bw-merge-window"
               target="_blank"
               rel="noreferrer"><code>bw-merge-window</code></a>.
          </p>
        </details>
      </Col>
    </Row>
  </Container>;
};

export default FAQPage;
