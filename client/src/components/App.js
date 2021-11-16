import React, {Component, useState} from 'react';
import {Route, Routes, useNavigate, useParams} from "react-router-dom";

import Controls from './Controls'
import Header from './Header'
import PeakResults from './PeakResults'
import HelpModal from "./HelpModal";


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
