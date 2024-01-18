import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {Outlet, useOutletContext, useParams} from "react-router-dom";

import {setNode} from "../../actions";
import {EPIVAR_NODES} from "../../config";
import {useNode} from "../../hooks";

const DatasetPage = () => {
  const dispatch = useDispatch();
  const {node: urlNode} = useParams();
  const node = useNode();

  useEffect(() => {
    const decodedNode = decodeURIComponent(urlNode);
    if (!EPIVAR_NODES.find((n) => n === decodedNode)) return;  // Node doesn't exist in our list
    if (node === urlNode) return;  // Node is already set in the Redux store
    console.info("setting node based on URL:", decodedNode);
    dispatch(setNode(decodedNode));
  }, [dispatch, urlNode]);

  const existingOutletContext = useOutletContext();

  return <div>
    <Outlet context={existingOutletContext} />
  </div>;
};

export default DatasetPage;
