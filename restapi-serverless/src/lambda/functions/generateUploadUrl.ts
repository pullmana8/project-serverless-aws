import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../helpers/utils/logger'
import {
    APIGatewayProxyHandler,
    APIGatewayProxyEvent,
    APIGatewayProxyResult
} from 'aws-lambda'
import { parseAuthorizationHeader, parseUserId } from "../authorization/token/lambdaUtils";


const logger = createLogger('todos')
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId) {
        logger.info('Todo id is not provided')
        return {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                message: "Please provide todo id in the url path"
            })
        }
    }
    const jwtToken = parseAuthorizationHeader(event.headers.Authorization)
    const userId = parseUserId(jwtToken)
    logger.info('Generating signed url for user by id', userId, todoId)
    const uploadUrl = s3.getSignedUrl('putObject', {
        bucket: bucketName,
        Key: `${userId}:${todoId}`,
        Expires: urlExpiration
    })

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl
        }, null, 2)
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
            uploadUrl
        }, null, 2)
    }
}