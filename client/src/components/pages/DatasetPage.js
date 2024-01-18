import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {Outlet, useOutletContext, useParams} from "react-router-dom";

import {setNode} from "../../actions";
import {EPIVAR_NODES} from "../../config";

const DatasetPage = () => {
  const dispatch = useDispatch();
  const {node} = useParams();

  useEffect(() => {
    const decodedNode = decodeURIComponent(node);
    if (!EPIVAR_NODES.find((n) => n === decodedNode)) return;
    console.info("setting node based on URL:", decodedNode);
    dispatch(setNode(decodedNode));
  }, [dispatch, node]);

  const existingOutletContext = useOutletContext();

  return <div>
    <Outlet context={existingOutletContext} />
  </div>;
};

export default DatasetPage;
