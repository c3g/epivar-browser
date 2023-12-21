import React from 'react'
import {useSelector} from "react-redux";
import {Alert, Button, Container, Input} from 'reactstrap'
import {Link, useLocation, useNavigate} from "react-router-dom";

import Icon from "./Icon";

import {SITE_SUBTITLE, SITE_TITLE} from "../constants/app";

export default function Header({children, onAbout, /*onDatasets, */onDatasetAbout, onOverview, onExplore, onFAQ,
                                 /*, onContact*/}) {
  const location = useLocation();
  const navigate = useNavigate();

  const node = useSelector(state => state.ui.node);
  const dataset = useSelector((state) => state.dataset.data);
  const userData = useSelector(state => state.user);
  const messages = useSelector(state => state.messages);

  return <div>
    <div className='Header'>
      <div className="Header__auth">
        {node && userData.data
          ? (
            <span>Authenticated with <code>{node}</code> as {userData.data.ip}</span>
          ) : null
          // <a href="/api/auth/logout">{userData.data?.displayName ?? userData.data?.id} (Log Out)</a>
          // <a href={`${LOGIN_PATH}?redirect=${encodeURIComponent(window.location.pathname)}`}>Log In / Sign Up</a>
        }
      </div>
      <Container>
        <h1 className='Header__title'><Link to="/about" className='Link'>{SITE_TITLE}</Link></h1>
        <h4 className='Header__subtitle'>{SITE_SUBTITLE}</h4>
        <div className="Header__dataset">
          <div>
            <label htmlFor="dataset-selector"></label>
            <Input type="select" id="dataset-selector">
              <option>{dataset.title ?? ""} ({dataset.assembly ?? ""})</option>
            </Input>
          </div>
        </div>
        <div className="Header__links">
          {/*<Button color="link"*/}
          {/*        className={location.pathname.startsWith("/datasets") ? "active" : ""}*/}
          {/*        onClick={onDatasets}><Icon name="table" bootstrap={true} />Datasets</Button>*/}
          <div className="Header__highlight_group">
            <Button color="link"
                    className={location.pathname.startsWith("/dataset/about") ? "active" : ""}
                    onClick={onDatasetAbout}>
              <Icon name="info-circle" bootstrap={true}/>About</Button>
            <Button color="link"
                    className={location.pathname.startsWith("/dataset/overview") ? "active" : ""}
                    onClick={onOverview}><Icon name="graph-up" bootstrap={true} />Overview</Button>
            <Button color="link"
                    className={"highlight" + (location.pathname.startsWith("/dataset/explore") ? " active" : "")}
                    onClick={onExplore}><Icon name="search" bootstrap={true} />Explore</Button>
          </div>
          <Button color="link"
                  className={location.pathname.startsWith("/about") ? "active" : ""}
                  onClick={onAbout}><Icon name="people-fill" bootstrap={true} />About EpiVar</Button>
          <Button color="link"
                  className={location.pathname.startsWith("/faq") ? "active" : ""}
                  onClick={onFAQ}><Icon name="question-circle" bootstrap={true} />FAQ</Button>
        </div>
        { children }
      </Container>
    </div>

    {location.pathname === "/auth-failure" && (
      <Container>
        <Alert color="danger" style={{marginTop: 16}} toggle={() => navigate("/")}>
          <p>
            An error was encountered during log in. Please try again.
            {/*or <a href="#" onClick={onContact}>contact us</a> for assistance.*/}
          </p>
          {messages.list.length && (
            <p style={{marginBottom: 0}}>
              <strong>Message(s):</strong> '{messages.list.join("', '")}'
            </p>
          )}
        </Alert>
      </Container>
    )}
  </div>;
}
