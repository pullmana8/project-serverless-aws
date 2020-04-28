import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid'
import { LoadTodos } from "../dataLayer/loadTodos";
import { TodoItem } from "../models/data/todoItem";
import { CreateTodoRequest } from "../models/requests/createTodoRequest";
import { UpdateTodoRequest } from "../models/requests/updateTodoRequests";
import { createLogger } from "../helpers/utils/logger";

/* Setup S3 url expiration */
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration: number = 300
const todo = new LoadTodos()
const logger = createLogger('todos')

/* Get all todos */
export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return await todo.getAllTodos(userId)
}

/* Create todo item */
export async function createTodo(userId: string, request: CreateTodoRequest): Promise<TodoItem> {
    const todoId = uuid()
    const data = {
        todoId,
        userId,
        ...request
    }
    return await todo.createTodo(data)
}

/* Update todo item */
export async function updateTodoItem(userId: string, todoId: string, payload: UpdateTodoRequest): Promise<void> {
    return await todo.updateTodoItem(todoId, userId, payload)
}

export async function todoItemExists(userId: string, todoId: string){
    const item = await todo.getTodoIdByUser(userId, todoId)
    logger.info('Get todos', item)
    return !!item
}

/* Delete todo item */
export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    await todo.deleteTodoById(userId, todoId)
}

/* Update item to add attachment image */
export async function getUploadUrl(userId: string, todoId: string){
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })

    if (signedUrl) {
        await addAttachmentUrl(bucketName, todoId, userId)
        return signedUrl
    }
}

async function addAttachmentUrl(bucketName, todoId, userId){
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    await todo.updateTodoAttachmentItem(userId, todoId, attachmentUrl)
}