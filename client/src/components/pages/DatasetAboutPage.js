import React, {useEffect, useMemo} from "react";
import {useLocation} from "react-router-dom";
import {Container} from "reactstrap";

import * as DOMPurify from "dompurify";
import {useCurrentDataset} from "../../hooks";

const DatasetAboutPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const element = document.querySelector(location.hash);
    if (!element) return;
    element.scrollIntoView();
  }, [location]);

  const dataset = useCurrentDataset();

  /** @type string */
  const datasetAboutContent = useMemo(() => dataset?.aboutContent ?? "<em>Loading...</em>", [dataset]);
  const sanitizedHTMLContent = useMemo(
    () => ({__html: DOMPurify.sanitize(datasetAboutContent, {USE_PROFILES: {html: true}})}),
    [datasetAboutContent]);

  return <Container className="Page">
    <div dangerouslySetInnerHTML={sanitizedHTMLContent} />
  </Container>;
};

export default DatasetAboutPage;
