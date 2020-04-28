import "source-map-support/register";
import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk"
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createLogger } from "../../helpers/utils/logger";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { parseAuthorizationHeader, parseUserId } from "../authorization/token/lambdaUtils";

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const logger = createLogger('generateSignedUrl')
const bucketName = process.env.ATTACHMENTS_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    if(!todoId) {
        logger.info('Todo id is not provided')
        return {
            statusCode: 404,
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
        body: JSON.stringify({
            uploadUrl
        }, null, 2)
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            uploadUrl
        }, null, 2)
    }
})
handler.use(cors())