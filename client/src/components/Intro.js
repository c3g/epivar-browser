import React from "react";

import {Button, Col, Container, Row} from "reactstrap";

const Intro = ({onAccess}) => (
  <Container className="Page">
    <Row>
      <Col md="12" lg={{size: 10, offset: 1}}>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid fuga id maiores perspiciatis quo totam velit
          voluptate! Consequuntur dolor dolore eius eveniet natus placeat quos temporibus voluptas. Debitis dolore, fuga!
        </p>
        <Button onClick={onAccess}>Access the Data</Button>
      </Col>
    </Row>
  </Container>
);

export default Intro;
