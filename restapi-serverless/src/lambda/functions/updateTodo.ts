import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../helpers/utils/logger'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { UpdateTodoRequest } from '../../models/requests/updateTodoRequests'
import { getUserId } from '../../helpers/utils/authHelper'

const logger = createLogger('todos')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    createLogger(`Processing update todos event: ${event}`)
    
    const todoId = event.pathParameters.todoId
    const payload: UpdateTodoRequest = JSON.parse(event.body)
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)

    const item = await todosAccess.getTodoById(todoId)
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
            statusCode: 400,
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
    await new TodosAccess().updateTodo(todoId, userId, payload)

    return {
        statusCode: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            input: event,
        }, null, 2),
    };
}