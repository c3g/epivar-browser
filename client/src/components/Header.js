import React, {useState} from 'react'
import {Button, Container} from 'reactstrap'
import {Link} from "react-router-dom";

import AboutModal from "./AboutModal";
import ContactModal from "./ContactModal";
import Icon from "./Icon";

export default function Header({ children }) {
  const [aboutModal, setAboutModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const aboutToggle = () => setAboutModal(!aboutModal);
  const contactToggle = () => setContactModal(!contactModal);

  return <div className='Header'>
    <Container>
      <h1 className='Header__title'><Link to="/" className='Link'>IMMUNPOP</Link></h1>
      <h4 className='Header__subtitle'>Epigenetic & Expression QTLs</h4>
      <div className="Header__links">
        <Button color="link" onClick={aboutToggle}>
          <Icon name="users" /> About
        </Button>
        <Button color="link" onClick={contactToggle}>
          <Icon name="envelope" /> Contact
        </Button>
      </div>
      <AboutModal isOpen={aboutModal} toggle={aboutToggle} />
      <ContactModal isOpen={contactModal} toggle={contactToggle} />
      { children }
    </Container>
  </div>;
}
