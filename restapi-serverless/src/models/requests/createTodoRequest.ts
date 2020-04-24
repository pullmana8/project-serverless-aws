/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
    userId: string
    todoId: string
    createdAt: string
    name: string
    dueDate: string
    done: boolean
  }
  