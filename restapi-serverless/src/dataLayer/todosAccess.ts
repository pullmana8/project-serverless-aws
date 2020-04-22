import { TodoItem } from '../models/TodoItem'
import * as AWS from 'aws-sdk'

export class TodosAccess {
    constructor(
        private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) { }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todo
        }).promise()

        return todo
    }
}