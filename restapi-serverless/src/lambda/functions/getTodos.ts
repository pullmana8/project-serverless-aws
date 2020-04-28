import "source-map-support/register"
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { getAllTodos } from "../../businessLogic/todosAccess";

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
        const todos = await getAllTodos(jwtToken)
        logger.info(`Processing get todos with event: ${event}`)

        return {
            statusCode: 200,
            body: JSON.stringify({
                items: todos
            }, null, 2)
        }
    } catch (error) {
        return {
            statusCode: 401,
            body: JSON.stringify({
                error: error.message
            })
        }
    }
})

handler.use(cors())