import { TodosAccess } from "../dataLayer/todosAccess"
import { TodoItem } from "../models/TodoItem"
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests"

const todosAccess = new TodosAccess()

/* Get all todo items */
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return await getAllTodos(userId)
}

/* Update Todo Section */
export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
    return await todosAccess.updateTodo(todoId, userId, payload)
  }

  export async function todoExists(todoId: string, userId: string) {
    const item = await todosAccess.getTodo(todoId, userId)
  
    console.log('Get todo: ', item)
    return !!item
  }
  