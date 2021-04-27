const initialState = {
  isInitialized: false,
  isUnlocked: false
}

export default function optionsReducer(state = initialState, action) {
  switch (action.type) {
    case 'options/setIsInitialized': {
      return {
        ...state,
        isInitialized: action.payload
      }
    }
    case 'options/setIsUnlocked': {
      return {
        ...state,
        isUnlocked: action.payload
      }
    }
		default:
			return state
	}
}
