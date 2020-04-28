import { createLogger } from "../../helpers/utils/logger";
import { S3Event, S3EventRecord, S3Handler } from "aws-lambda";
import { updateTodoImageUrl } from "../../businessLogic/todosAccess";
import * as querystring from "querystring";

const bucketName = process.env.ATTACHMENTS_BUCKET
const logger = createLogger('updateS3ImageUrl')

export const handler: S3Handler = async (event: S3Event) => {
    logger.log('Processing S3 event ', JSON.stringify(event))
    for (const record of event.Records) {
        await processImage(record)
    }
}

async function processImage(record: S3EventRecord){
    const key = querystring.unescape(record.s3.object.key)
    const split = key.split(':')
    const userId = split[0]
    const todoId = split[1]
    logger.info('Processing S3 item with key: ', key)
    const attachmentUrl = `https://{bucketName}.s3.amazonaws.com/${record.s3.object.key}`
    return updateTodoImageUrl(userId, todoId, attachmentUrl)

}