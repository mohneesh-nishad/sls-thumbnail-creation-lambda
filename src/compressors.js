const sharp = require('sharp');

export async function createJpegThumb(blob, quality) {
    console.log('jpeg thumb creator called');
    const img = await sharp(blob)
        // .resize({ width: 512, height: 512 })
        .jpeg({ progressive: true, quality: quality, mozjpeg: true })
        .toBuffer({ resolveWithObject: true })
    return img
}

export async function createWebpThumb(blob) {
    const img = await sharp(blob, { animated: true })
        // .resize({ width: 512, height: 512 })
        .webp({ lossless: true })
        .toBuffer()
    return img
}

export async function createPngThumb(blob, quality) {
    console.log('PNG thumb creator called');
    const thumb = await sharp(blob).withMetadata()
        .png({ quality: quality, compressionLevel: 9, force: false, effort: 10 }).toBuffer({ resolveWithObject: true })
    return thumb;
}