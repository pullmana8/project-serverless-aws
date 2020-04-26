import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { createLogger } from "../../helpers/utils/logger";
import { getUserId } from "../authorization/token/lambdaUtils";

const logger = createLogger('todos')
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const userIdIndex = process.env.USER_ID_INDEX

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    logger.info(`get todo items for user ${userId} and processing todos with event ${event}`)

    const result = await docClient.query({
        TableName: todosTable,
        IndexName: userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        },
        ScanIndexForward: true
    }).promise()

    if (result.Count !== 0) {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(result.Items[0])
        }
    } else {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: ''
        }
    }
}