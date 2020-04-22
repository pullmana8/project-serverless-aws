import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { UpdateTodoRequest } from '../../models/requests/updateTodoRequests'
import { createLogger } from '../../helpers/utils/logger'
import { getUserId } from '../authorization/authToken/utils'
import { updateTodo } from '../../businessLogic/todos'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    createLogger(`Processing update todos event: ${event}`)

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    const validTodo = await todoExists(todoId, userId)

    if (!validTodo) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    const payload: UpdateTodoRequest = JSON.parse(event.body)

    await updateTodo(todoId, userId, payload)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            message: 'Update all todo items'
        }, null, 2),
    };
}