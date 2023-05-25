import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'font-awesome/css/font-awesome.min.css';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import {BrowserRouter as Router} from 'react-router-dom';
import thunkMiddleware from 'redux-thunk';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { composeWithDevToolsLogOnlyInProduction } from '@redux-devtools/extension';

import './styles.css';
import { rootReducer } from './reducers';
import App from './components/App';
import {fetchAssays, fetchChroms, fetchMessages, fetchUser} from './actions.js'


const initialState = {};

const store = createStore(
  rootReducer,
  initialState,

  // Inject Redux dev tools middleware if it's available:
  composeWithDevToolsLogOnlyInProduction(
    applyMiddleware(
      thunkMiddleware,
      // Inject development-only middleware:
      ...(process.env.NODE_ENV === 'production' ? [] : [createLogger()]),
    )
  ),
);

render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.querySelector('#root')
);

store.dispatch(fetchUser())
store.dispatch(fetchMessages())  // Server-side messages, e.g. auth errors

store.dispatch(fetchAssays())
store.dispatch(fetchChroms())



// HMR

if (module.hot) {
  module.hot.accept(['./components/App'], () => {
    const NextApp = require('./components/App').default;
    render(
      <Provider store={store}>
        <NextApp />
      </Provider>,
      document.querySelector('#root')
    );
  });
}
