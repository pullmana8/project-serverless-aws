import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda'
import 'source-map-support/register'
import { TodosAccess } from '../../dataLayer/todosAccess'
import { getUserId } from '../../helpers/utils/authHelper'
import { createLogger } from '../../helpers/utils/logger'
import { S3Helper } from '../../helpers/utils/s3Helper'

const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)
    logger.info(`get todo items for user ${userId}`)
    const result = await new TodosAccess().getUserTodos(userId)

    for (const record of result) {
        record.attachmentUrl = await S3Helper.getTodoAttachmentUrl(record.todoId)
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(
            {
                result
            },
            null,
            2
        )
    }
}
