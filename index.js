const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 40000;

const storage = multer.diskStorage({
    destination: './upload',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000000000
    }
});

app.use('/profile', express.static('upload'));

app.post('/upload', upload.single('profile'), async (req, res) => {
    if (req.file) {
        // If file is uploaded
        res.json({
            success: 1,
            message: 'Image uploaded successfully',
            image: `http://localhost:${PORT}/profile/${req.file.filename}`
        });
    } else if (req.body.profile) {
        // If image URL is provided
        const imageUrl = req.body.profile;

        try {
            // Download image from the provided URL
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

            // Generate a filename
            const filename = `image_${Date.now()}.jpg`; // Assuming you want to save as JPG

            // Write the downloaded image buffer to the upload directory
            fs.writeFileSync(path.join(__dirname, 'upload', filename), response.data);

            res.json({
                success: 1,
                message: 'Image uploaded successfully',
                image: `http://localhost:${PORT}/profile/${filename}`
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            res.json({
                success: 0,
                message: 'Error uploading image'
            });
        }
    } else {
        res.json({
            success: 0,
            message: 'No file or image URL provided'
        });
    }
});

function errHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        res.json({
            success: 0,
            message: err.message
        });
    } else {
        res.json({
            success: 0,
            message: 'Unexpected error occurred'
        });
    }
}
app.use(errHandler);

app.listen(PORT, () => {
    console.log(`Server up and running on port ${PORT}`);
});
