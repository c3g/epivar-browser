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
              C3G</a> at McGill University &copy; 2017-2023</span><br />
            <em>
              Version {packageJson.version} &bull;{" "}
              <a href="https://github.com/c3g/epivar-browser" target="_blank" rel="nofollow">source code</a>
            </em><br />
          </div>
        </div>
      </div>
      <nav className="Footer__nav">
        <ul>
          {/*<li><Link to="/datasets">Datasets</Link></li>*/}
          <li><Link to="/dataset/about">About Dataset</Link></li>
          <li><Link to="/dataset/overview">Overview</Link></li>
          <li><Link to="/dataset/explore">Explore</Link></li>
          <li><Link to="/about">About EpiVar</Link></li>
          <li><a href="#" onClick={onTerms}>Terms of Use</a></li>
        </ul>
      </nav>
    </div>
  </Container>
);

export default Footer;
