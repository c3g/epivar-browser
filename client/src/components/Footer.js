import React from "react";
import {Container} from "reactstrap";

const Footer = ({onHelp, onAbout, onContact, onTerms}) => (
  <Container>
    <div className="Footer">
      <div className="Footer__text">
      TODO: Some footer text here.
      </div>
      <nav className="Footer__nav">
        <ul>
          <li><a href="#" onClick={onHelp}>Help</a></li>
          <li><a href="#" onClick={onAbout}>About</a></li>
          <li><a href="#" onClick={onContact}>Contact</a></li>
          <li><a href="#" onClick={onTerms}>Terms of Use</a></li>
        </ul>
      </nav>
    </div>
  </Container>
);

export default Footer;
