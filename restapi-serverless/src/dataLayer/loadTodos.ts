import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../helpers/utils/logger';
import { TodoItem } from "../models/data/todoItem";
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'

const logger = createLogger('todos')

export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient({ convertEmptyValues: true }),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    /* Get all todos */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Getting all todos for current user ${userId}`)
        const params = {
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: true
        }
        const result = await this.docClient.query(params).promise()
        return result.Items as TodoItem[]
    }

    /* If todo item exists by user logged in */
    async getTodoIdByUser(userId: string, todoId: string){
        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
        return result.Item
    }
    
    /* Create Todo Item */
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        return todo
    }

    /* Update Todo Item */
    async updateTodoItem(userId: string, todoId: string, todoItemUpdated: UpdateTodoRequest): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
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
                todoId,
                userId
            },
            UpdateExpression: 'SET attachmentUrl = :attachment',
            ExpressionAttributeValues: {
                ':attachment': attachmentUrl
            }
        }).promise()
    }

    /* Delete Todo Item */
    async deleteTodoById(todoId: string, userId: string) {
        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise()
        } catch(err) {
            logger.info(`Error while deleting todo item: ${err}`)
        }
    }
}
