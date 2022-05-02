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
        <h3>Data Download</h3>
        <p>
          TODO
        </p>
      </Col>
    </Row>
  </Container>;
};

export default DatasetsPage;
