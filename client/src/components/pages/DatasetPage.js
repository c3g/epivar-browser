import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {Outlet, useParams} from "react-router-dom";

import {setNode} from "../../actions";
import {EPIVAR_NODES} from "../../config";

const DatasetPage = () => {
  const dispatch = useDispatch();
  const {node} = useParams();

  useEffect(() => {
    const decodedNode = decodeURIComponent(node);
    if (!EPIVAR_NODES.find((n) => n === decodedNode)) return;
    dispatch(setNode(decodedNode));
  }, [dispatch, node]);

  return <div>
    <Outlet />
  </div>;
};

export default DatasetPage;
