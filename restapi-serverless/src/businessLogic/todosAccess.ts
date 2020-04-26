import { LoadTodos } from "../dataLayer/loadTodos"
import { TodoItem } from "../models/data/todoItem"
import { v4 as uuid } from 'uuid'
import { CreateTodoRequest } from "../models/requests/createTodoRequest"
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests"
import { getUserId } from "../lambda/authorization/token/lambdaUtils"
import { APIGatewayProxyEvent } from "aws-lambda"
import { createLogger } from "../helpers/utils/logger"

const logger = createLogger('todos')
const todo = new LoadTodos()

/* Get all todos */
/* export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return await todo.getAllTodos(userId)
}
*/

export async function getAllTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event)
    logger.info(`get todo items for user ${userId} and processing todos with event ${event}`)
    
    const todosList = todo.getAllTodos(userId)
    return todosList
}

/* Create todo item */
export async function createTodo(event: APIGatewayProxyEvent): Promise<TodoItem> {
    const itemId = uuid()
    const userId = getUserId(event)
    const newTodo: CreateTodoRequest = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    const createdTodo = await todo.createTodo(
        {
            userId: userId,
            todoId: itemId,
            createdAt: new Date().toISOString,
            done: false,
            ...newTodo
        }
    );
    return createdTodo
}
/* Update todos */
export async function updateTodo(todoId: string, userId: string, payload: UpdateTodoRequest): Promise<void> {
    return await todo.updateTodo(todoId, userId, payload)
}

/* Delete todo item */
export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todo.deleteTodoById(todoId, userId)
}

