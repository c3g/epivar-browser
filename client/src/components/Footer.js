import React from "react";
import {Container} from "reactstrap";
import {Link} from "react-router-dom";

import packageJson from "../../package.json";

const Footer = ({onContact, onTerms}) => (
  <Container>
    <div className="Footer">
      <div className="Footer__text">
        <span>TODO: Some footer text here.</span>{" "}
        <em>Version {packageJson.version}</em>
      </div>
      <nav className="Footer__nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/datasets">Datasets</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          <li><a href="#" onClick={onContact}>Contact</a></li>
          <li><a href="#" onClick={onTerms}>Terms of Use</a></li>
        </ul>
      </nav>
    </div>
  </Container>
);

export default Footer;
