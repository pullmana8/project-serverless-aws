import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { LoadTodos } from '../../dataLayer/loadTodos';
import { createLogger } from '../../helpers/utils/logger';
import { getUserId } from '../authorization/token/lambdaUtils';

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    if(!todoId){
        logger.error('Invalid delete attempt without todo id')
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({
                message: 'Invalid parameters',
                input: event,
            }, null, 2)
        }
    }

    const item = await todosAccess.getTodoById(userId, todoId)
    if(item.Count == 0){
        logger.error(`user ${userId} requesting delete for non existing todo with id ${todoId}`)
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
        logger.error(`user ${userId} requesting delete todo item does not belong to this user's account with id ${todoId}`)
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

    logger.info(`User ${userId} deleting todo item ${todoId}`)

    await new LoadTodos().deleteTodoById(userId, todoId)
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