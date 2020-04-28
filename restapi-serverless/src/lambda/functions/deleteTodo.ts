import "source-map-support/register"
import * as middy from "middy"
import { cors } from "middy/middlewares";
import { APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import { createLogger } from '../../helpers/utils/logger';
import { parseAuthorizationHeader } from "../authorization/token/lambdaUtils";
import { deleteTodo } from "../../businessLogic/todosAccess";

const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId){
        // logs when user tries to delete an todo item with an id
        logger.error(`Invalid delete attempt without todo id`)
        return {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Please provide todo Id in the url path'
            })
        }
    }
    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
    await deleteTodo(jwtToken, todoId)

    // Logs when user delete todo item
    logger.info('Deleted todo item', todoId)

    return {
        statusCode: 200,
        body: null
    }
})
handler.use(cors())