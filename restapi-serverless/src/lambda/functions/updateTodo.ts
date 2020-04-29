import "source-map-support/register"
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { UpdateTodoRequest } from "../../models/requests/updateTodoRequests";
import { updateTodo } from "../../businessLogic/todosAccess";

const logger = createLogger('todos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updateTodoRequest: UpdateTodoRequest = JSON.parse(event.body)
    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)

    const validTodoItem = await updateTodo(jwtToken, todoId, updateTodoRequest)
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: 'Todo item has been updated', updated: validTodoItem
        })
    }
})
handler.use(cors())