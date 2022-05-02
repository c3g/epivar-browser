import Controls from "../Controls";
import {Outlet, useNavigate, useOutletContext, useParams} from "react-router-dom";

const ExplorePage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const {toggleHelp} = useOutletContext();

  return <div>
    <Controls params={params} navigate={navigate} toggleHelp={toggleHelp} />
    <Outlet />
  </div>
};

export default ExplorePage;
