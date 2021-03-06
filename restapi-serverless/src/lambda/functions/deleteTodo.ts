import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { TodosAccess } from '../../dataLayer/todosAccess';
import { createLogger } from '../../helpers/utils/logger';
import { getUserId } from '../../helpers/utils/authHelper';

const logger = createLogger('todos')
const todosAccess = new TodosAccess()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
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

    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)

    const item = await todosAccess.getTodoById(todoId)
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
    await new TodosAccess().deleteTodoById(todoId)

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