import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { getUserId } from "../authorization/token/lambdaUtils";
import { LoadTodos } from '../../dataLayer/loadTodos'
import {getAllTodos} from "../../businessLogic/todosAccess";

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const todos = await getAllTodos(userId)
    logger.info(`Processing get todos with event: ${event}`)

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