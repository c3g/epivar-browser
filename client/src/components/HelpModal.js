import React from "react";

import {Modal, ModalBody, ModalHeader} from "reactstrap";

const HelpModal = ({isOpen, toggle}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>Help</ModalHeader>
    <ModalBody>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem cum doloremque illo molestiae provident
      reprehenderit similique tempora ullam? A aliquam dignissimos, earum maxime minima rem similique ullam unde velit
      voluptatum.
    </ModalBody>
  </Modal>
);

export default HelpModal;
