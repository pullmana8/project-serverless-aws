import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../helpers/utils/logger';
import { TodoItem } from "../models/data/todoItem";
import { TodoUpdate } from '../models/data/todoUpdate'
import {updateTodo} from "../businessLogic/todosAccess";

const logger = createLogger('todos')

export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    /* Get all todos */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todo items for user ${userId}`)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: true
        }).promise()
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Creating todo for user', todo.userId)
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    /* Update Todo Item */
    async updateTodoItem(userId: string, todoId: string, updatedTodoItem: TodoUpdate) {
        const updatedTodo = await this.docClient.update({
            TableName: this.todosTable,
            Key: { userId, todoId },
            ExpressionAttributeNames: { "#N": "name" },
            UpdateExpression: "set #N=:todoName, dueDate=:dueDate, done=:done",
            ExpressionAttributeValues: {
                ":todoName": updatedTodoItem.name,
                ":dueDate": updatedTodoItem.dueDate,
                ":done": updatedTodoItem.done
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        return { Updated: updatedTodo }
    }

    /* Update item to add attachment */
    async updateTodoAttachmentItem(userId: string, todoId: string, attachmentUrl: string): Promise<any> {
        logger.info('Updating todo item with attachment url for user by id', userId, todoId, attachmentUrl)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachment',
            ExpressionAttributeValues: {
                ':attachment': attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()

        return null
    }

    /* Delete Todo Item */
    async deleteTodoById(userId: string, todoId: string): Promise<any> {
        // Logs when user is deleting item sucessfully by todo id
        logger.info('Deleting todos for user by todo id', userId, todoId)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            }
        }).promise()
        return null
    }
}
