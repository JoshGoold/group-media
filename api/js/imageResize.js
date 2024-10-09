const sharp = require('sharp')


const resizeImage = async (image) => {
    try {
        const resizedImage = await sharp(image)
            .resize(200, 200)
            .toFormat('webp', { quality: 80 })
            .toBuffer();  // Convert the image to a buffer for output

        console.log('Image resized to 300x300');
        return resizedImage;  // Return the resized image as a buffer
    } catch (error) {
        console.error('Error resizing image', error);
    }
};


module.exports = resizeImage