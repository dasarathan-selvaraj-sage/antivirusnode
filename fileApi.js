const express = require('express');
const multer = require('multer');
const NodeClam = require("clamscan");
const { Readable } = require('stream');
const app = express();

const ClamScan = new NodeClam()
ClamScan.init(
    {
        debugMode: false,
        clamdscan: {
            host: 'localhost',
            port: 3310,
            timeout: 60000
        },
        preference: 'clamdscan'
    });

// Set up multer for file upload handling
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
var result;

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    console.log(`Received file: ${file.originalname}`);
    const readableStream = new Readable();
    readableStream._read = () => {}; // Noop function to satisfy the Readable interface
    readableStream.push(file.buffer);
    readableStream.push(null); // Signify the end of the stream
    ClamScan.scanStream(readableStream, (err, {isInfected, viruses}) => {
        if (err) {
            res.status(500).send(err);
            return console.error(err)
        }
        if (isInfected) {
            res.status(200).send('File is infected! - Threat name:', viruses);
            return console.log('File is infected! - Threat name:', viruses);
        }
        result = 'File is not infected!'
        console.log('File is not infected!');
    });

    readableStream.on('end', () => {
        console.log('Download complete.');
    });

    // Respond to the client
    res.send(result);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
