import React, {useEffect} from "react";
import {useLocation} from "react-router-dom";

const NotFound = ({context}) => {
  const location = useLocation();

  useEffect(() => {
    console.debug("not found location", location);
  }, [location]);

  return (
    <div>
      <h2>Not Found{context ? `: ${context}` : null}</h2>
    </div>
  );
};

export default NotFound;
