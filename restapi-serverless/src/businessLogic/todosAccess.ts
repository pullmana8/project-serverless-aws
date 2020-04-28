import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid'
import { LoadTodos } from "../dataLayer/loadTodos";
import { createLogger } from "../helpers/utils/logger";
import { TodoItem } from "../models/data/todoItem";
import { CreateTodoRequest } from "../models/requests/createTodoRequest";
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests";
import { parseUserId } from "../lambda/authorization/token/lambdaUtils";
import {TodoUpdate} from "../models/data/todoUpdate";

const loadTodos = new LoadTodos()
const logger = createLogger('todos')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

/* Setup S3 url expiration */
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration: number = 300

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

/* Delete todo item */
export async function deleteTodo(jwtToken: string, todoId: string): Promise<any> {
    const userId = parseUserId(jwtToken)
    return await loadTodos.deleteTodoById(userId, todoId)
}

/* Update todo items */
export async function todoItemExists(jwtToken: string){
    const userId = parseUserId(jwtToken)
    const item = await loadTodos.getTodoIdByUser(jwtToken)
    logger.info('Get todos', item)
    return !!item
}

export async function updateTodo(jwtToken: string, todoId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
    const userId = parseUserId(jwtToken)
    return await loadTodos.updateTodoItem(todoId, userId, updateTodoRequest)
}

/* Update item to add attachment image */
export async function updateAttachmentUrl(attachmentUrl: string, userId: string, todoId: string): Promise<any> {
    return loadTodos.updateTodoAttachmentItem(attachmentUrl, userId, todoId)
}