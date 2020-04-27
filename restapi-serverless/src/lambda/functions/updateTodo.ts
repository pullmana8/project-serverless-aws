import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../helpers/utils/logger'
import { LoadTodos } from '../../dataLayer/loadTodos'
import { getUserId } from '../authorization/token/lambdaUtils'
import { UpdateTodoRequest } from '../../models/requests/updateTodoRequests'

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    createLogger(`Processing update todos event: ${event}`)
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    const item = await todosAccess.getTodoById(userId)
    if(item.Count == 0){
        logger.error(`user ${userId} requesting update for non existing todo with id ${todoId}`)
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: 'TODO item does not exist',
                input: event,
            }, null, 2)
        }
    }

    if(item.Items[0].userId !== userId){
        logger.error(`user ${userId} requesting update todo item does not belong to this user's account with id ${todoId}`)
        return {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentialls': true,
            },
            body: JSON.stringify({
                message: 'TODO item does not belong to user',
                input: event,
            }, null, 2)
        }
    }

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    logger.info(`User ${userId} updating todo item ${todoId} to ${updatedTodo}`)
    await new LoadTodos().updateTodo(updatedTodo, todoId)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
        }, null, 2),
    };
}