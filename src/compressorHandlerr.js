const sharp = require('sharp');
const { createJpegThumb, createPngThumb } = require("./compressors");



exports.callCompressor = async (blob, quality) => {
    const meta = await sharp(blob).metadata()
    console.log('image metadata  --->>>>>', meta);
    console.log('original image size ==>> ' + (meta.size / (1000 * 1000)).toFixed(3) + ' MB')


    switch (meta.format) {
        case 'jpeg':
            return createJpegThumb(blob, quality)
        case 'png':
            return createPngThumb(blob, quality)
        default:
            throw new Error('Compressor not set for encoding : ' + meta.format)
    }
}