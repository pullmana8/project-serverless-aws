import { TodosAccess } from "../dataLayer/todosAccess"
import { CreateTodoRequest } from "../models/requests/createTodoRequest"
import { TodoItem } from "../models/TodoItem"
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()

export async function createTodo(request: CreateTodoRequest): Promise<TodoItem> {

    const itemId = uuid.v4()
    const time = new Date().toISOString()

    return await todosAccess.createTodo({
        todoId: itemId,
        name: request.name,
        dueDate: request.dueDate,
        createdAt: time,
        done: true
    })    
}