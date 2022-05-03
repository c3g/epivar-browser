import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {Link, useLocation} from "react-router-dom";

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
      <Col md="12" lg={{size: 10, offset: 1}}>
        <h2>About</h2>
        <p>
          Humans display remarkable immune response variation when exposed to identical immune challenges.
          For this project, we carried out in-depth genetic, epigenetic, and transcriptional profiles on primary
          macrophages derived from a panel of European and African-ancestry individuals, before and after
          infection with influenza A virus (IAV) (see below).
        </p>
        <figure>
          <img width={600} height={387} src="/figure1A.png" alt="Figure showing methodology" />
        </figure>
        <p id="papers">
          The results of this project are summarized in 3 papers:
        </p>
        <ol>
          <li>
            Aracena et al. [TODO: link]. Epigenetic variation impacts ancestry-associated differences in the
            transcriptional response to influenza infection.
          </li>
          <li>
            Chen et al. [TODO: link]. Transposable elements are associated with the variable response to
            influenza infection.
          </li>
          <li>
            Groza et al. [TODO: link]. Genome graphs detect human polymorphisms in active epigenomic state during
            influenza infection.
          </li>
        </ol>
        <p>
          All the datasets that have been generated as part of this project are summarized and{" "}
          <Link to="/datasets">made available here</Link>. Access to some of the raw datasets require a formal data
          access request but all resources are available freely. Please cite the appropriate paper(s) if you use
          the data.
        </p>
        <p>
          We have also built a <Link to="/explore">browser tool</Link> that allows navigation of these rich datasets by
          condition, ancestry and, importantly, haplotype. This allows an in-depth exploration of the quantitative
          trait loci and other key results reported in the studies above. Using this tool requires a simple registration
          to ensure data privacy conditions are respected.
        </p>
        <h3>Team</h3>
        <ul>
          <li>Katherine A Aracena</li>
          <li>Yen-Lung Lin</li>
          <li>Kaixuan Luo</li>
          <li>Alain Pacis</li>
          <li>Saideep Gona</li>
          <li>Zepeng Mu</li>
          <li>Vania Yotova</li>
          <li>Renata Sindeaux</li>
          <li>Albena Pramatarova</li>
          <li>Marie-Michelle Simon</li>
          <li>Xun Chen</li>
          <li>Cristian Groza</li>
          <li>David Lougheed</li>
          <li>Romain Gr&eacute;goire</li>
          <li>David Brownlee</li>
          <li>Yang Li</li>
          <li>Xin He</li>
          <li>Hanshi Liu</li>
          <li>Yann Joly</li>
          <li>David Bujold</li>
          <li>Tomi Pastinen</li>
          <li>Guillaume Bourque</li>
          <li>Luis B Barreiro</li>
        </ul>
        <h3>Funding and Support</h3>
        <p>
          This work was supported by a Canada Institute of Health Research (CIHR) program grant (CEE-151618) for the
          McGill Epigenomics Mapping Center, which is part of the Canadian Epigenetics, Environment and Health Research
          Consortium (CEEHRC) Network. The work on EpiVar was also supported by a Genome Canada grant called EpiShare
          (TODO: add nb) and a Technology Platform grant for the Canadian Center for Computational Genomics (C3G).
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
