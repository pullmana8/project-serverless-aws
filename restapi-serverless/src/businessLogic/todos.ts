import { TodosAccess } from "../dataLayer/todosAccess"
import { CreateTodoRequest } from "../models/requests/createTodoRequest"
import { TodoItem } from "../models/TodoItem"
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()

export async function createTodo(payload: CreateTodoRequest): Promise<TodoItem> {

    const todoId = uuid.v4()

    const data = {
        todoId,
        ...payload
    }

    return await todosAccess.createTodo(data)
}