import {useSelector} from "react-redux";

export const useNode = () => useSelector((state) => state.ui.node);
