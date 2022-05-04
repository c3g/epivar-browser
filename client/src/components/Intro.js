import React from "react";

import {Button, Col, Container, Row} from "reactstrap";

const Intro = ({onAccess, onTerms, signedIn}) => (
  <Container className="Page">
    <Row>
      <Col md="12" lg={{size: 10, offset: 1}}>
        <p>
          To explore the data, you must first{" "}
          {!signedIn && <><a href="#" onClick={onAccess}>sign up or sign in</a> and</>}{" "}agree to our
          {" "}<a href="#" onClick={onTerms}>terms of use</a>.
        </p>
        <Button onClick={onAccess}>Access the Data</Button>
      </Col>
    </Row>
  </Container>
);

export default Intro;
