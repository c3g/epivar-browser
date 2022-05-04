import {Col, Container, Row} from "reactstrap";

const FAQPage = () => {
  return <Container className="Page">
    <Row>
      <Col md="12" lg={{size: 10, offset: 1}}>
        <h2>FAQ</h2>
        <details open={true}>
          <summary>How are the QTL plots generated?</summary>
          <p>
            To generate plots, we use the UCSC <em>bigWigSummary</em> tool to calculate average signal across a feature
            for each sample upon request. These values are combined with genotype information extracted from a{" "}
            <a href="https://gemini.readthedocs.io/en/latest/"
               target="_blank"
               rel="noreferrer">Gemini database</a> into a box plot on a server, which is
            then sent to the user’s browser if they have signed in and agreed to the terms of use. Plots are generated
            as needed, rather than in advance, and are derived directly from the track and genotype data.
          </p>
        </details>
        <details open={true}>
          <summary>How are the genomic tracks generated?</summary>
          <p>
            Genome browser tracks were created with the HOMER <em>makeUCSCfile</em> command and{" "}
            <em>bedGraphToBigWig</em> utility from UCSC. Tracks were normalized so that each value represents the read
            count per base pair per 10 million reads.  We generate{" "}
            <a href="https://genome.ucsc.edu/"
               target="_blank"
               rel="noreferrer">UCSC Genome Browser</a> track hubs upon
            request to visualize averaged track segments for a given genomic feature. These tracks are created on the
            fly by averaging bigWig regions of samples sharing an experimental treatment and genotype.
          </p>
        </details>
      </Col>
    </Row>
  </Container>;
};

export default FAQPage;
