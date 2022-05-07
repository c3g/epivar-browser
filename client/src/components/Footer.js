import React from "react";
import {Container} from "reactstrap";
import {Link} from "react-router-dom";

import packageJson from "../../package.json";

const Footer = ({/*onContact, */onTerms}) => (
  <Container>
    <div className="Footer">
      <div className="Footer__text">
        <div className="Footer__logo">
          <a href="https://computationalgenomics.ca" target="_blank" rel="nofollow">
            <img src="/c3g_logo_small.png" alt="Canadian Centre for Computational Genomics" />
          </a>
          <div>
            <span>Developed by <a href="https://computationalgenomics.ca" target="_blank" rel="nofollow">
              C3G</a> at McGill University{" "}</span><br />
            <em>Version {packageJson.version}</em><br />
          </div>
        </div>
      </div>
      <nav className="Footer__nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/datasets">Datasets</Link></li>
          <li><Link to="/explore">Explore</Link></li>
          {/*<li><a href="#" onClick={onContact}>Contact</a></li>*/}
          <li><a href="#" onClick={onTerms}>Terms of Use</a></li>
        </ul>
      </nav>
    </div>
  </Container>
);

export default Footer;
