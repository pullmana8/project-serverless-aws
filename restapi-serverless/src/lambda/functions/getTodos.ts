import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
import { createLogger } from "../../helpers/utils/logger";
import { getAllTodos } from "../../businessLogic/todos";
import { getUserId } from "../authorization/authToken/utils";

const logger = createLogger("todos");
// const docClient = new AWS.DynamoDB.DocumentClient();
// const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

  logger.info(`Processing getting all todo items with event: `, event);
  const userId = getUserId(event)
  const todos = await getAllTodos(userId)

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(
      {
        todos,
        input: event,
      },
      null,
      2
    ),
  };
};
