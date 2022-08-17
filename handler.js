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

async function createJpegThumb(blob, quality) {
    console.log('jpeg thumb creator called');
    const img = await sharp(blob)
        // .resize({ width: 512, height: 512 })
        .jpeg({ progressive: true, quality: quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true })
    return img
}

async function createWebpThumb(blob) {
    const img = await sharp(blob, { animated: true })
        .resize({ width: 512, height: 512 })
        .webp({ lossless: true })
        .toBuffer()
    return img
}

async function createPngThumb(blob, quality) {
    console.log('PNG thumb creator called');
    const thumb = await sharp(blob).withMetadata()
        .png({ quality: quality, compressionLevel: 9, force: false, effort: 10 }).toBuffer({ resolveWithObject: true })
    return thumb;
}


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


async function callCompressor(blob, quality) {
    const meta = await sharp(blob).metadata()
    console.log('image metadata  --->>>>>', meta);

    if (meta.format === 'jpeg') {
        return createJpegThumb(blob, quality)
    } else if (meta.format === 'png') {
        return createPngThumb(blob, quality)
    } else {
        throw new Error('Compressor not set for encoding : ' + meta.format)
    }
}

exports.main = async (event) => {
    // console.log(event)

    try {
        /* code */
        const body = JSON.parse(event.Records[0].body)
        // console.log(body);
        const content = JSON.parse(body.Message)
        console.info(content)

        const { s3Data } = content

        const { Bucket, Key } = s3Data

        console.log({ Bucket, Key })

        const getFile = await s3.getObject({ Bucket, Key }).promise()

        if (!getFile) throw new Error('FATAL error ==>> File not Found')

        const imgBlob = getFile.Body

        const ext = path.extname(Key)
        console.log({ ext })

        const th = await callCompressor(imgBlob, 70)

        console.log(th);

        const thumbData = {
            Bucket,
            Key: Key.replace(ext, '') + `_thumb` + ext,
            Body: th.data,
        }

        const s3Thumb = await saveThumb(thumbData)

        // const webpThumb = await saveThumb(thumbData2)
        console.log(s3Thumb)
        // console.log(webpThumb)
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
