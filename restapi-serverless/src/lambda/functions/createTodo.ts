import "source-map-support/register"
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";
import { CreateTodoRequest } from "../../models/requests/createTodoRequest";
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { createTodo } from "../../businessLogic/todosAccess";

const logger = createLogger('todos');

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = typeof event.body === "string" ? JSON.parse(event.body) : event.body

    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
    const item = await createTodo(jwtToken, newTodo)

    logger.info(`Creating new todo ${newTodo} for user ${jwtToken}`)
    return {
        statusCode: 201,
        body: JSON.stringify(
            {
                item
            },
            null,
            2
        ),
    };
})
handler.use(cors())
