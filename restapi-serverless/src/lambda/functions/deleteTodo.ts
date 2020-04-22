import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

export const handler: APIGatewayProxyHandler = async (event, _context) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            message: 'Delete all todo items',
            input: event,
        }, null, 2),
    };
}