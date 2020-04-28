import { v4 as uuid } from 'uuid'
import { parseUserId } from "../lambda/authorization/token/lambdaUtils";
import { LoadTodos } from "../dataLayer/loadTodos";
import { TodoItem } from "../models/data/todoItem";
import { TodoUpdate } from "../models/data/todoUpdate";
import { CreateTodoRequest } from "../models/requests/createTodoRequest";
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests";

const loadTodos = new LoadTodos()

/* Get all todos, SUCCESS */
export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
    const userId = parseUserId(jwtToken)
    return loadTodos.getAllTodos(userId)
}
/* Create todo item, SUCCESS */
export async function createTodo(jwtToken: string, payload: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid()
    const userId = parseUserId(jwtToken)
    return await loadTodos.createTodo({
        todoId: todoId,
        userId: userId,
        name: payload.name,
        dueDate: payload.dueDate,
        createdAt: new Date().toISOString(),
        attachmentUrl: payload.attachmentUrl,
        done: false,
    })
}

/* Update todo items */
export async function updateTodo(jwtToken: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken)
    return await loadTodos.updateTodoItem(todoId, userId, {
        name: updateTodoRequest.name,
        done: updateTodoRequest.done,
        dueDate: updateTodoRequest.dueDate
    })
}

/* Update item to add attachment image */
export async function updateTodoImageUrl(attachmentUrl: string, userId: string, todoId: string): Promise<any> {
    return loadTodos.updateTodoAttachmentItem(attachmentUrl, userId, todoId)
}

/* Delete todo item SUCCESS */
export async function deleteTodo(jwtToken: string, todoId: string): Promise<any> {
    const userId = parseUserId(jwtToken)
    return await loadTodos.deleteTodoById(userId, todoId)
}