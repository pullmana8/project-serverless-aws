import { LoadTodos } from '../../dataLayer/loadTodos'
import { createLogger } from '../../helpers/utils/logger'
import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda'
import {getUserId} from "../authorization/token/lambdaUtils";
import { getUploadUrl, todoItemExists } from "../../businessLogic/todosAccess";

const logger = createLogger('todos')
const todosAccess = new LoadTodos()

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const validTodoItem = await todoItemExists(userId, todoId)

    if(!validTodoItem){
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

    const url = await getUploadUrl(userId, todoId)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl: url
        })
    }
}