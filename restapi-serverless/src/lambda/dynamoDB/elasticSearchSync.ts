import { DynamoDBStreamHandler, DynamoDBStreamEvent } from "aws-lambda";
import { createLogger } from "../../helpers/utils/logger";

const logger = createLogger('stream')

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
    logger.info(`Processing events batch from DynamoDB`, JSON.stringify(event))

    for (const record of event.Records) {
        logger.info(`Processing record`, JSON.stringify(record))
    }
}