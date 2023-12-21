import React, {useEffect, useMemo} from "react";
import {useSelector} from "react-redux";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";

import * as DOMPurify from "dompurify";

const DatasetAboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (!element) return;
    element.scrollIntoView();
  }, [location]);

  // noinspection JSUnresolvedReference
  /** @type string */
  const datasetAboutContent = useSelector((state) => state.dataset.data?.aboutContent ?? "<em>Loading...</em>");
  const sanitizedHTMLContent = useMemo(
    () => ({__html: DOMPurify.sanitize(datasetAboutContent, {USE_PROFILES: {html: true}})}),
    [datasetAboutContent]);

  return <Container className="Page">
    <div dangerouslySetInnerHTML={sanitizedHTMLContent} />
  </Container>;
};

export default DatasetAboutPage;
