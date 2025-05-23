import React from "react";

import {Modal, ModalBody, ModalHeader} from "reactstrap";

const ContactModal = ({isOpen, toggle}) => (
  <Modal isOpen={isOpen} toggle={toggle}>
    <ModalHeader toggle={toggle}>Contact</ModalHeader>
    <ModalBody>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem cum doloremque illo molestiae provident
      reprehenderit similique tempora ullam? A aliquam dignissimos, earum maxime minima rem similique ullam unde velit
      voluptatum.
    </ModalBody>
  </Modal>
);

export default ContactModal;
