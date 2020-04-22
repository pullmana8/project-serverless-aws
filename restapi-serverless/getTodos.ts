import { APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'

export const getTodos: APIGatewayProxyHandler = async (event, _context) => {

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Retrieve all todo items',
            input: event,
        }, null, 2),
    };
}