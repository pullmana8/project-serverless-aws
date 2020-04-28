import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { v4 as uuid } from 'uuid'
import { createLogger } from '../helpers/utils/logger';
import { TodoItem } from "../models/data/todoItem";
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
import { CreateTodoRequest } from "../models/requests/createTodoRequest";

const logger = createLogger('todos')

export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
//        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    /* Get all todos */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for current user ${userId}`)
        const params = {
            TableName: this.todosTable,
//            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false
        }
        const result = await this.docClient.query(params).promise()
        return result.Items as TodoItem[]
    }

    /* If todo item exists by user logged in */
    async getTodoIdByUser(userId: string, id: string): Promise<AWS.DynamoDB.QueryOutput>{
       return await this.docClient.query({
           TableName: this.todosTable,
           KeyConditionExpression: 'todoId = :todoId',
           ExpressionAttributeValues: {
               ':todoId': id,
               ':userId': userId
           }
       }).promise()
    }

    async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const newId = uuid()

        let item: TodoItem

        item.userId = userId
        item.todoId = newId
        item.createdAt = new Date().toISOString()
        item.name = request.name
        item.dueDate = request.dueDate
        item.done = request.done
        item.attachmentUrl = request.attachmentUrl

        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        })
        return item
    }

    /* Update Todo Item */
    async updateTodoItem(userId: string, todoId: string, todoItemUpdated: UpdateTodoRequest): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            ExpressionAttributeNames: {
                '#N': 'name'
            },
            UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoItemUpdated.name,
                ':dueDate': todoItemUpdated.dueDate,
                ':done': todoItemUpdated.done
            }
        }).promise()
    }

    /* Update item to add attachment */
    async updateTodoAttachmentItem(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                todoId
            },
            UpdateExpression: 'SET attachmentUrl = :attachment',
            ExpressionAttributeValues: {
                ':attachment': attachmentUrl
            }
        }).promise()
    }

    /* Delete Todo Item */
    async deleteTodoById(userId: string, todoId: string) {
        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    userId,
                    todoId
                }
            }).promise()
        } catch(err) {
            logger.info(`Error while deleting todo item: ${err}`)
        }
    }
}
