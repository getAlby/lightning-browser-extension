const initialState = [
  { id: 0, text: 'Learn React', completed: true },
  { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
  { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
]

function nextTodoId(todos) {
  const maxId = todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1)
  return maxId + 1
}


export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/addTodo': {
      // Can return just the new todos array - no extra object around it
      return [
        ...state,
        {
          id: nextTodoId(state),
          text: action.payload,
          completed: false
        }
      ]
    }
		default:
			return state
	}
}
