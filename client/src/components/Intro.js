import React from "react";

import {Button, Container} from "reactstrap";

const Intro = ({onAccess}) => (
  <Container style={{marginTop: 24}}>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid fuga id maiores perspiciatis quo totam velit
      voluptate! Consequuntur dolor dolore eius eveniet natus placeat quos temporibus voluptas. Debitis dolore, fuga!
    </p>
    <Button onClick={onAccess}>Access the Data</Button>
  </Container>
);

export default Intro;
