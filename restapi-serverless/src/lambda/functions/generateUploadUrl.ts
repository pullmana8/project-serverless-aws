import { TodosAccess } from '../../dataLayer/todosAccess'
import { createLogger } from '../../helpers/utils/logger'
import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda'
import { getUserId } from '../../helpers/utils/authHelper'
import { S3Helper } from '../../helpers/utils/s3Helper'

const todosAccess = new TodosAccess()
const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)

    const item = await todosAccess.getTodoById(todoId)

    if (item.Count == 0) {
        logger.error(
            `user ${userId} requesting to put url for non existing todo item with id ${todoId}`
        )

        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Alow-Credentials': true
            },
            body: JSON.stringify({
                message: 'TODO does not exist',
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

    const url = new S3Helper().getPresignedUrl(todoId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Alow-Credentials': true
        },
        body: JSON.stringify({
            url,
            input: event,
        }, null, 2)
    }
}
