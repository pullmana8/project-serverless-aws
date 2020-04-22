import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import { createLogger } from "../../helpers/utils/logger";
import { CreateTodoRequest } from "../../models/requests/createTodoRequest";
import { TodosAccess } from "../../dataLayer/todosAccess";

const logger = createLogger('todos');

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    
    const newItem = await new TodosAccess().createTodo(newTodo)
    logger.info('Create a new date ${newTodo} for user');

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
