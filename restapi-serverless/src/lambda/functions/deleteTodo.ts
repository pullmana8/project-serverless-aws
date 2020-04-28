import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../helpers/utils/logger';
import { deleteTodo, todoItemExists } from "../../businessLogic/todosAccess";
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";

const logger = createLogger('todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId){
        logger.error(`Invalid delete attempt without todo id`)
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                error: 'Please provide todo Id in the url path'
            })
        }
    }

    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
    const validTodoItem = await todoItemExists(todoId)
    if(!validTodoItem) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                error: 'Todo item does not exist, please create a new todo item or select the right item to delete'
            })
        }
    }

    await deleteTodo(todoId, jwtToken)
    logger.info('Deleted todo item', todoId)
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
    }
}