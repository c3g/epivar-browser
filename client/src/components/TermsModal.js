import React, {useState} from "react";

import {Button, Form, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";

const TermsModal = ({isOpen, toggle, showAgree, onAgree}) => {
  const [agreeChecked, setAgreeChecked] = useState(false);

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Terms of Use</ModalHeader>
      <ModalBody>
        <div>
          TODO
        </div>
        {showAgree && (
          <Form>
            <FormGroup check={true}>
              <Input id="terms-checkbox" type="checkbox" onChange={e => setAgreeChecked(e.target.checked)} />
              {" "}
              <Label check={true} for="terms-checkbox">
                I agree to these terms
              </Label>
            </FormGroup>
          </Form>
        )}
      </ModalBody>
      {showAgree && (
        <ModalFooter>
          <Button color="primary" disabled={!agreeChecked} onClick={() => {
            if (agreeChecked) onAgree();
          }}>Agree</Button>
          {" "}
          <Button onClick={toggle}>Cancel</Button>
        </ModalFooter>
      )}
    </Modal>
  );
};

export default TermsModal;
