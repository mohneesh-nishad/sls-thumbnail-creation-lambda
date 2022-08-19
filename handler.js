const path = require('path');
const { callCompressor } = require('./src/compressorHandlerr');
const { s3, saveThumb } = require('./src/s3_handler');


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

        console.log(`image's sharp blob after compression`, th);
        console.log('compressed image size  ==>>>  ' + (th.info.size / (1000 * 1000)).toFixed(3) + '_MB')
        const thumbData = {
            Bucket,
            Key: Key.replace('input/images', 'Defaults'),
            Body: th.data,
        }

        const s3Obj = await saveThumb(thumbData)

        console.log('bucket new object data \n', s3Obj)

        console.log('----------  image compressed successfully  -----------')

        const response = { statusCode: 200, body: { event } };
        return response;
    } catch (e) {
        console.error(e)
    }
};
