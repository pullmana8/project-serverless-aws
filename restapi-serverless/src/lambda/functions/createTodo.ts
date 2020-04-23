import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import { createLogger } from "../../helpers/utils/logger";
import { CreateTodoRequest } from "../../models/requests/createTodoRequest";
import { TodosAccess } from "../../dataLayer/todosAccess";
import { getUserId } from "../authorization/token/lambdaUtils";

const logger = createLogger('todos');

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    const userId = getUserId(event)

    // const authHeader = event.headers['Authorization']
    // const userId = getUserId(authHeader)
    
    logger.info('Create a new date ${newTodo} for user ${userId}');
    const newItem = await new TodosAccess().createTodo(newTodo, userId)

    return {
        statusCode: 201,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(
            {
                newItem
            }
        ),
    };
};
