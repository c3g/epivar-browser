import React, {useState} from 'react'
import {useSelector} from "react-redux";
import {Alert, Button, Container} from 'reactstrap'
import {Link, useLocation} from "react-router-dom";

import AboutModal from "./AboutModal";
import ContactModal from "./ContactModal";
import Icon from "./Icon";

export default function Header({ children }) {
  const location = useLocation();

  const [aboutModal, setAboutModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const aboutToggle = () => setAboutModal(!aboutModal);
  const contactToggle = () => setContactModal(!contactModal);

  const userData = useSelector(state => state.user);

  return <div>
    <div className='Header'>
      <div className="Header__auth">
        {userData.data
          ? (
            <a href="/api/auth/logout">{userData.data?.displayName ?? userData.data?.id} (Log Out)</a>
          ) : <a href="/api/auth/login">Log In</a>
        }
      </div>
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
    </div>

    {location.pathname === "/auth-failure" ? (
      <Container>
        <Alert color="danger" style={{marginTop: 16}}>
          An error was encountered during log in. Please try again or contact us for assistance.
        </Alert>
      </Container>
    ) : null}
  </div>;
}
