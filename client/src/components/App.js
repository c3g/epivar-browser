import React, {Component, useState} from 'react';
import {Route, Routes, useNavigate, useParams} from "react-router-dom";

import Controls from './Controls'
import Header from './Header'
import PeakResults from './PeakResults'
import HelpModal from "./HelpModal";
import {ETHNICITY_BOX_COLOR} from "../constants/app";


const AppWithParams = () => {
  const navigate = useNavigate();
  const params = useParams();

  const [helpModal, setHelpModal] = useState(false);
  const toggleHelp = () => setHelpModal(!helpModal);

  return (
    <div className="RoutedApp">
      <Header>
        <HelpModal isOpen={helpModal} toggle={toggleHelp} />
        <Controls params={params} navigate={navigate} toggleHelp={toggleHelp} />
      </Header>

      <PeakResults />
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
          <Route path="/:chrom/:position/:assay" element={<AppWithParams />} />
          <Route path="/:chrom/:position" element={<AppWithParams />} />
          <Route path="/" element={<AppWithParams />} />
        </Routes>
      </div>
    )
  }
}


export default App;
