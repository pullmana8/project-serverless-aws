import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../helpers/utils/logger'
import { LoadTodos } from '../../dataLayer/loadTodos'
import { getUserId } from '../authorization/token/lambdaUtils'
import { UpdateTodoRequest } from '../../models/requests/updateTodoRequests'
import { todoItemExists, updateTodoItem} from "../../businessLogic/todosAccess";

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Processing update todos event: ${event}`)
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const validTodoItem = await todoItemExists(todoId, userId)

    if(!validTodoItem) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    const payload: UpdateTodoRequest = JSON.parse(event.body)
    logger.info(`User ${userId} updating todo item ${todoId} to ${payload}`)
    await updateTodoItem(userId, todoId, payload)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({})
    };
}