import {useSelector} from "react-redux";

export const useDevMode = () => useSelector((state) => state.ui.devMode);

export const useNode = () => useSelector((state) => state.ui.node);
export const useUrlEncodedNode = () => {
  const node = useNode();
  return encodeURIComponent(node ?? "");
}

export const useDatasetsByNode = () => useSelector((state) => state.datasets.datasetsByNode);

export const useCurrentDataset = () => {
  const node = useNode();
  const datasetsByNode = useDatasetsByNode();
  return datasetsByNode[node];
};
