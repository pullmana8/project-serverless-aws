import { TodoItem } from "../models/data/todoItem";
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from "../helpers/utils/logger";

export class LoadTodos {
    constructor(
        private readonly XAWS = AWSXRay.captureAWS(AWS),
        private readonly docClient: AWS.DynamoDB.DocumentClient = new XAWS.DynamoDB.DocumentClient(),
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
                ':userId': userId
            }
        }
        const result = await this.docClient.query(params).promise()
        return result.Items as TodoItem[]
    }

    /* Get todo by ids */
    async getTodoById(todoId: string, userId: string){

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()

        return result.Item
    }

    /* Create Todo item */
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    /* Update Todo Item */
    async updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<void> {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                'todoId':todoId,
                'userId':userId
            },
            ExpressionAttributeNames: {
                '#namefield': 'name'
            },
            UpdateExpression: 'SET #namefield = :n, dueDate = :d, done = :done',
            ExpressionAttributeValues: {
                ':n': updatedTodo.name,
                ':d': updatedTodo.dueDate,
                ':done': updatedTodo.done
            }
        }).promise()
    }

    async deleteTodoById(todoId: string, userId: string): Promise<void> {
        try {
            await this.docClient.delete({
                TableName: this.todosTable,
                Key: {
                    todoId,
                    userId
                }
            }).promise()
        } catch (err) {
            createLogger(`Error while deleting document: ${err}`)
        }
    }
}
