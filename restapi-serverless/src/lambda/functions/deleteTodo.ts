import 'source-map-support/register'
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { LoadTodos } from '../../dataLayer/loadTodos';
import { createLogger } from '../../helpers/utils/logger';
import { getUserId } from '../authorization/token/lambdaUtils';
import { deleteTodo, todoItemExists } from "../../businessLogic/todosAccess";

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const validTodoItem = await todoItemExists(userId, todoId)

    if(!validTodoItem) {
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                error: 'Todo item does not exist'
            })
        }
    }

    await deleteTodo(userId, todoId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({})
    }

}