/**
 * Fields in a request to create a single TODO item.
 */
export interface CreateTodoRequest {
    name: string
    createdAt?: string
    dueDate: string
    done?: boolean
    attachmentUrl?: string
  }
  