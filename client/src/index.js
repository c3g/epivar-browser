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

import './styles.css';
import registerServiceWorker from './registerServiceWorker';
import { rootReducer } from './reducers';
import App from './components/App';
import {fetchAssays, fetchChroms, fetchMessages, fetchUser} from './actions.js'


const initialState = {}
// const initialState = localStorage.state ? JSON.parse(localStorage.state) : {}

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(
    thunkMiddleware,
    // Inject development-only middleware:
    ...(process.env.NODE_ENV === 'production' ? [] : [createLogger()]),
    // Inject Redux dev tools middleware if it's available:
    ...(window.__REDUX_DEVTOOLS_EXTENSION__ ? [window.__REDUX_DEVTOOLS_EXTENSION__()] : []),
  ),
);

render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>,
  document.querySelector('#root')
)

store.dispatch(fetchUser())
store.dispatch(fetchMessages())  // Server-side messages, e.g. auth errors

store.dispatch(fetchAssays())
store.dispatch(fetchChroms())

window.addEventListener('unload', () => {
  // TODO remove or implement this properly
  localStorage.state = JSON.stringify(store.getState())
})


// Register service worker

registerServiceWorker()



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
