import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import { createLogger } from "../../helpers/utils/logger";
import { CreateTodoRequest } from "../../models/requests/createTodoRequest";
import { getUserId } from "../authorization/token/lambdaUtils";
import { LoadTodos } from "../../dataLayer/loadTodos";

const logger = createLogger('todos');

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = typeof event.body === "string" ? JSON.parse(event.body) : event.body
    const userId = getUserId(event)
    logger.info(`Processing creating todos: ${event}`)
    
    const item = await new LoadTodos().createTodo(newTodo, userId)
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
