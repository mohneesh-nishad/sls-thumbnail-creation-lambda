const aws = require('aws-sdk');

aws.config.update({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.ACCESS_SECRET || ''
    }
})

const s3 = new aws.S3()


async function saveThumb(thumbData) {
    const params = {
        Bucket: thumbData.Bucket,
        Key: thumbData.Key,
        Body: thumbData.Body,
        Tagging: `_thumbnail=true`
    }
    const thumb = s3.upload(params).promise()
    return thumb;
}

module.exports = { s3, saveThumb }