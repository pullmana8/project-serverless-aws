import { TodoItem } from '../models/TodoItem'
import * as AWS from 'aws-sdk'
import { UpdateTodoRequest } from '../models/requests/updateTodoRequests'

export class TodosAccess {
  constructor(
    private readonly docClient: AWS.DynamoDB.DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE) { }

  /* Get all todo items */
  async getAllTodos(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todo items')

    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }
    const result = await this.docClient.query(params).promise()
    return result.Items as TodoItem[]
  }

  /* Create Todo Section */
  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      }).promise()

    return todo
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

  async getTodo(todoId: string, userId: string) {
    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        }
      })
      .promise()

    return result.Item
  }
}

