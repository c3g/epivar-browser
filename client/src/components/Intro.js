import React from "react";

import {Button, Container} from "reactstrap";

const Intro = () => (
  <Container style={{marginTop: 24}}>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid fuga id maiores perspiciatis quo totam velit
      voluptate! Consequuntur dolor dolore eius eveniet natus placeat quos temporibus voluptas. Debitis dolore, fuga!
    </p>
    <Button onClick={() => window.location.href = "/api/auth/login"}>Access the Data</Button>
  </Container>
);

export default Intro;
