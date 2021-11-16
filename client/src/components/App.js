import React, {Component, useState} from 'react';
import {Redirect, Route, Switch, useHistory, useParams} from "react-router-dom";

import Controls from './Controls'
import Header from './Header'
import PeakResults from './PeakResults'
import HelpModal from "./HelpModal";


const AppWithParams = () => {
  const history = useHistory();
  const params = useParams();

  const [helpModal, setHelpModal] = useState(false);
  const toggleHelp = () => setHelpModal(!helpModal);

  return (
    <div className="RoutedApp">
      <Header>
        <HelpModal isOpen={helpModal} toggle={toggleHelp} />
        <Controls params={params} history={history} toggleHelp={toggleHelp} />
      </Header>

      <PeakResults />
    </div>
  )
};


class App extends Component {

  render() {
    return (
      <div className='App'>
        <Switch>
          <Route path="/:chrom/:position/:assay" children={<AppWithParams />} />
          <Route path="/:chrom/:position" children={<AppWithParams />} />
          <Route path="/" children={<AppWithParams />} />
        </Switch>
      </div>
    )
  }
}


export default App;
