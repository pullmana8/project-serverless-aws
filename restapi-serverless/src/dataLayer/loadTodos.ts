import { v4 as uuid } from 'uuid'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from "../models/data/todoItem";
import { CreateTodoRequest } from "../models/requests/createTodoRequest";
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient({convertEmptyValues: true}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    /* Get all todos */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        console.log('Getting all todos')
        const params = {
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId':userId
            }
        }
        const result = await this.docClient.query(params).promise()
        return result.Items as TodoItem[]
    }

    /* Get todo by ids */
    async getTodoById(id: string): Promise<AWS.DynamoDB.QueryOutput>{
        return await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues:{
                ':todoId': id
            }
        }).promise()
    }

    /* Create Todo Item */
    async createTodo(request: CreateTodoRequest, userId: string): Promise<TodoItem> {
        const todoId = uuid()
        const data = {
            todoId,
            userId,
            ...request
        }

        await this.docClient.put({
            TableName: this.todosTable,
            Item: data
        })
        return data
    }

    /* Update Todo Item */
    async updateTodo(todoId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId':todoId
            },
            ExpressionAttributeNames: {
                '#namefield': 'name'
            },
            UpdateExpression: 'set #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':d': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        }).promise()
    }

    async deleteTodoById(todoId: string) {
        const param = {
            TableName: this.todosTable,
            Key: {
                'todoId':todoId
            }
        }
        await this.docClient.delete(param).promise()
    }
}
