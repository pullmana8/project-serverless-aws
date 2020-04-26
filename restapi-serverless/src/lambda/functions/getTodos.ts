import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { getAllTodos } from "../../businessLogic/todosAccess";
import { getUserId } from "../authorization/token/lambdaUtils";

const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    logger.info(`Processing get todos with event: ${event}`)
    const userId = getUserId(event)
    const todos = await getAllTodos(userId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            items: todos
        })
    }
}