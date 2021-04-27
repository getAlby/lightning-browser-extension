import { combineReducers } from 'redux'

import accountsReducer from './features/accounts/accountsSlice'
import optionsReducer from './features/options/optionsSlice'

const rootReducer = combineReducers({
  // Define a top-level state field named `accounts`, handled by `accountsReducer`
  accounts: accountsReducer,
  options: optionsReducer
})

export default rootReducer
