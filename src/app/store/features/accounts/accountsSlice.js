const initialState = [
  { id: 0, text: 'Learn React', completed: true },
  { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
  { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
]

function nextAccountId(accounts) {
  const maxId = accounts.reduce((maxId, account) => Math.max(account.id, maxId), -1)
  return maxId + 1
}


export default function accountsReducer(state = initialState, action) {
  switch (action.type) {
    case 'accounts/addAccount': {
      // Can return just the new accounts array - no extra object around it
      return [
        ...state,
        {
          id: nextAccountId(state),
          text: action.payload,
          completed: false
        }
      ]
    }
		default:
			return state
	}
}
