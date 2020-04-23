import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import * as uuid from 'uuid'
import { TodoItem } from '../models/data/TodoItem'
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
import { CreateTodoRequest } from '../models/requests/createTodoRequest'
export class TodosAccess {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX) { }

    /* Get todo items by user */
    async getUserTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
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
        const todoId = uuid.v4()

        const todoData = {
            todoId,
            userId,
            ...payload
        }

        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoData
            }).promise()

        return todoData
    }

    /* Update Todo Section */
    async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
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
                ':name': updatedTodo.name,
                ':dueDate': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        }).promise()
    }

    async deleteTodoById(todoId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                "todoId": todoId
            }
        }

        await this.docClient.delete(param).promise()
    }
}