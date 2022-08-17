const aws = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');

aws.config.update({
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || '',
        secretAccessKey: process.env.ACCESS_SECRET || ''
    }
})

const s3 = new aws.S3()

async function createSharpThumb(blob) {
    const img = await sharp(blob)
        .resize({ width: 200, height: 200 })
        .png({ progressive: true, quality: 80 })
        .toBuffer()
    return img
}


async function saveThumb(thumbData) {
    const params = {
        Bucket: thumbData.Bucket,
        Key: thumbData.Key,
        Body: thumbData.Body,
        Tagging: `_thumbnail=true`
    }
    const thumb = s3.putObject(params).promise()
    return thumb;
}

exports.handler = async (event) => {
    // TODO implement
    console.log(event)

    try {
        /* code */
        const content = JSON.parse(event.Records[0].body.message)
        console.info(content)

        const { s3Data } = content

        const { Bucket, Key } = s3Data

        console.log({ Bucket, Key })

        const getFile = await s3.getObject({ Bucket, Key }).promise()

        if (!getFile) throw new Error('FATAL error ==>> File not Found')

        const imgBlob = getFile.Body

        const thumb = await createSharpThumb(imgBlob)

        const thumbData = {
            Bucket,
            Key: `${Key}_thumb` + path.extname(Key),
            Body: thumb,
        }
        const s3Thumb = await saveThumb(thumbData)

        console.log(s3Thumb)
        console.log('----------   THumbnail created successfully  -----------')

        const response = {
            statusCode: 200,
            body: {
                event
            },
        };
        return response;
    } catch (e) {
        console.error(e)
    }
};
