const NodeClam = require("clamscan");
const http = require('http');
const {PassThrough} = require('stream');
const url = 'http://localhost:8000/TestVirus.txt';

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

// This is a mimic for source provider sending the file as stream
function downloadFile(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}', status code: ${response.statusCode}`));
            }

            // Convert the response to a readable stream
            const readableStream = new PassThrough();
            response.pipe(readableStream);

            resolve(readableStream);
        }).on('error', (err) => {
            reject(err);
        });
    });
}

downloadFile(url)
    .then((readableStream) => {
        ClamScan.scanStream(readableStream, (err, {isInfected, viruses}) => {
            if (err) return console.error(err);
            if (isInfected) return console.log('File is infected! - Threat name:', viruses);
            console.log('File is not infected!');
        });

        readableStream.on('end', () => {
            console.log('Download complete.');
        });
    })
    .catch((err) => {
        console.error('Error downloading file:', err.message);
    });