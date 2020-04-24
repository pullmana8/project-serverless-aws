import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
import { CreateTodoRequest } from '../models/requests/createTodoRequest'
import { TodoItem } from '../models/data/TodoItem'
export class TodosAccess {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
//        private readonly userIdIndex = process.env.USER_ID_INDEX
        ) { }

    /* Get todo items by user */
    async getUserTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
//            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        return result.Items as TodoItem[]
    }

    /* Get users by Id */
    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput> {
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': id
            }
        }).promise()
    }

    /* Create Todo Section */
    async createTodo(payload: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const newId = uuid()

        const item = new TodoItem()

        item.userId = userId
        item.todoId = newId
        item.createdAt = new Date().toISOString()
        item.name = payload.name
        item.dueDate = payload.dueDate
        item.done = false

        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise()

        return item
    }

    /* Update Todo Section */
    async updateTodo(updatedTodo: UpdateTodoRequest, todoId: string) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId': todoId,
                
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':d': updatedTodo.dueDate,
                ':done': updatedTodo.done
            },
            ExpressionAttributeNames: {
                "#namefield": "name"
            }
        }).promise()
    }

    /* Delete Todo Section */
    async deleteTodoById(todoId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                'todoId': todoId
            }
        }

        await this.docClient.delete(param).promise()
    }
}