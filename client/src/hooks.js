import {useSelector} from "react-redux";

export const useNode = () => useSelector((state) => state.ui.node);
export const useDatasetsByNode = () => useSelector((state) => state.datasets.datasetsByNode);

export const useCurrentDataset = () => {
  const node = useNode();
  const datasetsByNode = useDatasetsByNode();
  return datasetsByNode[node];
};
