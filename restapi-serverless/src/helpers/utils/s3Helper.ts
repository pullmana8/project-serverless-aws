import * as AWS from "aws-sdk";

export class S3Helper {

    constructor(
        private readonly s3:AWS.S3 = new AWS.S3({
            signatureVersion: 'v4',
            region: process.env.region,
            params: {Bucket: process.env.ATTACHMENT_BUCKET}
            }),
        private readonly signedUrlExpireSeconds = 60 * 5
    ){ }

    async getTodoAttachmentUrl(todoId: string): Promise<string> {

        try {
            await this.s3.headObject({
                Bucket: process.env.ATTACHMENT_BUCKET,
                Key: `${todoId}.png`
            }).promise();

            return this.s3.getSignedUrl('getObject', {
                Bucket: process.env.ATTACHMENT_BUCKET,
                Key: `${todoId}.png`,
                Expires: this.signedUrlExpireSeconds
            });
        } catch(err) {
            console.log(err)
        } return null
    }

    getPresignedUrl(todoId: string): string{
        return this.s3.getSignedUrl('putObject', {
            Bucket: process.env.ATTACHMENT_BUCKET,
            Key: `${todoId}.png`,
            Expires: this.signedUrlExpireSeconds
        }) as string;
    }
}