import * as AWS from "aws-sdk";
import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from "aws-lambda";
import "source-map-support/register";
// import { ApiResponseHelper } from '../../helpers/utils/apiResponseHelper';
import { createLogger } from "../../helpers/utils/logger";

// const apiResponseHelper = new ApiResponseHelper
const logger = createLogger("todos");
const docClient = new AWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info(`Processing event: `, event);

  const result = await docClient
    .scan({
      TableName: todosTable,
    })
    .promise();

  const items = result.Items;

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(
      {
        items,
        input: event,
      },
      null,
      2
    ),
  };
};
