import "source-map-support/register"
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { UpdateTodoRequest } from "../../models/requests/updateTodoRequests";
import { todoItemExists, updateTodo } from "../../businessLogic/todosAccess";

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const payload: UpdateTodoRequest = JSON.parse(event.body)
    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)

    const validTodoItem = await todoItemExists(todoId)
    if (!validTodoItem) {
        logger.info(`Processing update todos event: ${event}`)
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    } else {
        await updateTodo(jwtToken, todoId, payload)
        logger.info('Updating todo by user', updateTodo)
        return {
            statusCode: 204,
            body: JSON.stringify({})
        };
    }
})
handler.use(cors())