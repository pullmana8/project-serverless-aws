import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import { createLogger } from "../../helpers/utils/logger";
import { CreateTodoRequest } from "../../models/requests/createTodoRequest";
import { getUserId } from "../../helpers/utils/authHelper";
import { TodosAccess } from "../../dataLayer/todosAccess";

const logger = createLogger('todos');

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const authHeader = event.headers['Authorization']
    const userId = getUserId(authHeader)
    
    logger.info(`create todo item for user ${userId} with data ${newTodo}`);

    const item = await new TodosAccess().createTodo(newTodo)

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(
            {
                item
            },
            null,
            2
        ),
    };
};
