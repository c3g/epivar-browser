import Controls from "../Controls";
import {Outlet, useNavigate, useParams} from "react-router-dom";

const ExplorePage = () => {
  const params = useParams();
  const navigate = useNavigate();

  return <div>
    <Controls params={params} navigate={navigate} toggleHelp={() => alert("TODO")} />
    <Outlet />
  </div>
};

export default ExplorePage;
