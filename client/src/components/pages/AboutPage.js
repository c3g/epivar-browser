import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {useLocation} from "react-router-dom";

const AboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (!element) return;
    element.scrollIntoView();
  }, [location]);

  return <Container className="Page">
    <Row>
      <Col md="12">
        <h2>About the EpiVar Browser</h2>
        <h3>Approach</h3>
        <p>
          The EpiVar Browser is a portal that enables the exploration of genetic and epigenetic datasets, generally
          under controlled access, and distributed at multiple locations. It allows researchers to explore the
          interaction between genomic variants and epigenetic features, such as histone tail modifications, chromatin
          accessibility, and the transcriptome. Because the information about individual genotypes is not accessible,
          identifiable data is not released. We believe our approach can accelerate analyses that would otherwise
          require a lengthy multi-step approval process and provides a generalisable strategy to facilitate responsible
          access to sensitive epigenomics data.
        </p>
        <p>
          The browser is described in the following preprint:
        </p>
        <p>
          <a href="https://www.biorxiv.org/content/10.1101/2023.08.03.551309v1" target="_blank" rel="nofollow">
            EpiVar Browser: advanced exploration of epigenomics data under controlled access
          </a><br />
          David&nbsp;R&nbsp;Lougheed, Hanshi&nbsp;Liu, Katherine&nbsp;A&nbsp;Aracena, Romain&nbsp;Grégoire,
          Alain&nbsp;Pacis, Tomi&nbsp;Pastinen, Luis&nbsp;B&nbsp;Barreiro, Yann&nbsp;Joly, David&nbsp;Bujold,
          Guillaume&nbsp;Bourque.<br />
          bioRxiv 2023.08.03.551309; doi:{" "}
          <a href="https://doi.org/10.1101/2023.08.03.551309" target="_blank" rel="nofollow">
            10.1101/2023.08.03.551309</a>
        </p>
        <h3>EpiVar Architecture</h3>
        <p>
          We employ a federated approach to build a multi-dataset portal where data processing can, when possible, occur
          at the data location. The portal’s interface contains a list of nodes, each of which hosts a single dataset,
          as shown in the figure below.
        </p>
        <p style={{ textAlign: "center" }}>
          <img
            src="/epivar_arch.png"
            alt="A workflow diagram of the EpiVar Browser, showing how the browser connects to multiple nodes."
            width="3829"
            height="2591"
            style={{ width: "100%", height: "auto", maxWidth: "960px" }}
          />
        </p>
        <h3>Contact</h3>
        <p>
          If you have any questions about the EpiVar Browser or would like to report any issue, please contact us
          at <a href="mailto:epivar@computationalgenomics.ca">epivar@computationalgenomics.ca</a>.
        </p>
      </Col>
    </Row>
    <Row>
      <Col md="12">
        <h3>Team</h3>
      </Col>
      <Col sm="12" md="5">
        <h4>McGill University / Kyoto University</h4>
        <ul>
          <li>Alain Pacis</li>
          <li>David Lougheed</li>
          <li>Albena Pramatarova</li>
          <li>Marie-Michelle Simon</li>
          <li>Xun Chen</li>
          <li>Cristian Groza</li>
          <li>Romain Gregoire</li>
          <li>David Brownlee</li>
          <li>Hanshi Liu</li>
          <li>Yann Joly</li>
          <li>David Bujold</li>
          <li>Tomi Pastinen</li>
          <li>Guillaume Bourque</li>
        </ul>
      </Col>
      <Col sm="12" md="7">
        <h4>University of Chicago / Universit&eacute; de Montr&eacute;al</h4>
        <ul>
          <li>Katherine A Aracena</li>
          <li>Yen-Lung Lin</li>
          <li>Kaixuan Luo</li>
          <li>Saideep Gona</li>
          <li>Zepeng Mu</li>
          <li>Vania Yotova</li>
          <li>Renata Sindeaux</li>
          <li>Yang Li</li>
          <li>Xin He</li>
          <li>Luis B Barreiro</li>
        </ul>
      </Col>
    </Row>
    <Row>
      <Col md="12">
        <h3>Funding and Support</h3>
        <p>
          This work was supported by a Canada Institute of Health Research (CIHR) program grant (CEE-151618) for the
          McGill Epigenomics Mapping Center, which is part of the Canadian Epigenetics, Environment and Health Research
          Consortium (CEEHRC) Network. The work on EpiVar was also supported by a Genome Canada grant called EpiShare
          (Genome Canada - 15502) and a Technology Platform grant for the 
          Canadian Center for Computational Genomics (C3G).
          This project was also supported by National Institute of Health Research grants R01-GM134376 and
          P30-DK042086 to L.B.B. GB is supported by a Canada Research Chair Tier 1 award, a FRQ-S, Distinguished Research
          Scholar award and by the World Premier International Research Center Initiative (WPI), NEXT, Japan. K.A.A. is
          supported by a grant to University of Chicago from the Howard Hughes Medical Institute through the
          James H. Gilliam Fellowships for Advanced Study program.
        </p>
      </Col>
    </Row>
  </Container>;
};

export default AboutPage;
