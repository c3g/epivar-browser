import React, {Component, useState} from 'react';
import {Navigate, Route, Routes, useNavigate, useParams} from "react-router-dom";

import Controls from './Controls'
import Header from './Header'
import PeakResults from './PeakResults'
import HelpModal from "./HelpModal";
import Intro from "./Intro";

import {ETHNICITY_BOX_COLOR} from "../constants/app";
import {useSelector} from "react-redux";


const AppWithParams = () => {
  const navigate = useNavigate();
  const params = useParams();

  const userData = useSelector(state => state.user);

  const [helpModal, setHelpModal] = useState(false);
  const toggleHelp = () => setHelpModal(!helpModal);

  return (
    <div className="RoutedApp">
      <Header>
        <HelpModal isOpen={helpModal} toggle={toggleHelp} />
        <Controls params={params} navigate={navigate} toggleHelp={toggleHelp} />
      </Header>

      {userData.isLoaded && !userData.data ? (
        <Intro />
      ) : (
        <PeakResults />
      )}
    </div>
  )
};


class App extends Component {
  render() {
    return (
      <div className='App'>
        <svg height={0} style={{position: "absolute"}}>
          <pattern id="diagonal" patternUnits="userSpaceOnUse" width={9} height={9} patternTransform="rotate(45 0 0)">
            <rect x={0} y={0} width={9} height={9} fill="#FFFFFF" />
            <line x1={3} y1={0} x2={3} y2={9} style={{
              stroke: ETHNICITY_BOX_COLOR.AF,
              strokeWidth: 6,
            }} />
            <line x1={7.5} y1={0} x2={7.5} y2={9} style={{
              stroke: ETHNICITY_BOX_COLOR.EU,
              strokeWidth: 3,
            }} />
          </pattern>
        </svg>

        <Routes>
          <Route path="/locus/:chrom/:position/:assay" element={<AppWithParams />} />
          <Route path="/locus/:chrom/:position" element={<AppWithParams />} />
          <Route path="/" exact={true} element={<AppWithParams />} />
          <Route path="/auth-failure" exact={true} element={<AppWithParams />} />
          <Route path="*" element={<Navigate to="/" />}/>
        </Routes>
      </div>
    )
  }
}


export default App;
