import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'

import App from './component/App'

const playgroundReducer = (state = [], action) => {
  switch (action.type) {
    case 'CHANGE_PLAYGROUND':
      return action.payload
    default:
      return state
  }
}

const modeReducer = (state = 'ONE', action) => {
  switch (action.type) {
    case 'CHANGE_MODE':
      return action.payload
    default:
      return state
  }
}

const store = createStore(
  combineReducers({ playground: playgroundReducer, mode: modeReducer }),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
)

window.store = store

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
