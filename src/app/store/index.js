import { createStore } from 'redux'
import rootReducer from './reducer'
import devToolsEnhancer from 'remote-redux-devtools'


// without devtools
// const store = createStore(rootReducer)

// for dev only, remove for release
const store = createStore(rootReducer, devToolsEnhancer({
  realtime: true,
  port: 8000
}))


export default store
