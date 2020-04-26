import { LoadTodos } from "../dataLayer/loadTodos"
import { TodoItem } from "../models/data/todoItem"
import { v4 as uuid } from 'uuid'
import { CreateTodoRequest } from "../models/requests/createTodoRequest"
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests"
import { createLogger } from "../helpers/utils/logger"

const logger = createLogger('todos')
const todo = new LoadTodos()

/* Get all todos */
 export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return await todo.getAllTodos(userId)
 }

/* Create todo item */
export async function createTodo(userId: string, payload: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid()

    const data = {
        todoId,
        userId,
        ...payload
    }

    return await todo.createTodo(data)
}

/* Update todos */
export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
    return await todo.updateTodo(todoId, userId, payload)
}

/* Delete todo item */
export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todo.deleteTodoById(todoId, userId)
}

