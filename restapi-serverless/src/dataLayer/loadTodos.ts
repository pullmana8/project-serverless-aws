import { v4 as uuid } from 'uuid'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { TodoItem } from "../models/data/todoItem";
import { CreateTodoRequest } from "../models/requests/createTodoRequest";
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
import { createLogger } from '../helpers/utils/logger';
export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient({convertEmptyValues: true}),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly userIdIndex = process.env.USER_ID_INDEX
    ) { }

    /* Get all todos */
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId':userId
            },
            ScanIndexForward: true
        }).promise()

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
    async updateTodo(updatedTodo: UpdateTodoRequest, todoId: string): Promise<void> {
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
            createLogger(`Error while deleting document: ${err}`)
        }
}
