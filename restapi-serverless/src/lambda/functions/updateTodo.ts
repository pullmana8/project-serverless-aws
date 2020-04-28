import 'source-map-support/register'
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../helpers/utils/logger'
import { LoadTodos } from '../../dataLayer/loadTodos'
import { UpdateTodoRequest } from '../../models/requests/updateTodoRequests'
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { updateTodo, todoItemExists } from '../../businessLogic/todosAccess'

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
    logger.info(`Processing update todos event: ${event}`)

    const validTodoItem = await todoItemExists(todoId)
    if(!validTodoItem) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    const payload: UpdateTodoRequest = JSON.parse(event.body)
    logger.info('Updating todo by user', updateTodo)
    await updateTodo(jwtToken, todoId, payload)

    return {
        statusCode: 204,
        body: JSON.stringify({})
    };
})

handler.use(cors())