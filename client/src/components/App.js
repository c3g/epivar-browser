import React, { Component } from 'react';
import {Redirect, Route, Switch, useHistory, useParams} from "react-router-dom";

import Controls from './Controls'
import Header from './Header'
import PeakResults from './PeakResults'


const AppWithParams = () => {
  const history = useHistory();
  const params = useParams();
  return (
    <div className="RoutedApp">
      <Header>
        <Controls params={params} history={history} />
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
          <Redirect to="/" />
        </Switch>
      </div>
    )
  }
}


export default App;
