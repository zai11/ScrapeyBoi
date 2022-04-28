const puppeteer = require('puppeteer');
const fs = require('fs');
const crypto = require('crypto');
const minify = require('@node-minify/core');
const htmlMinifier = require('@node-minify/html-minifier');
const compressor = require('compressing');

exports.scrape = async function(address, callback) {
    const filename = crypto.createHash('md5').update(address).digest('hex');
    const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto("https://" + address);
    let data = await page.evaluate(() => document.querySelector('*').outerHTML);
    await browser.close();
    fs.writeFile('./pages/' + filename + '.html', data, err => {
        compressFile(filename, (error) => {
            if (error === undefined) {
                const callback_object = {
                    status: "SUCCESS",
                    hash: filename,
                    error: "NONE"
                };
                callback(callback_object);
            }
            else {
                const callback_object = {
                    status: "FAILED",
                    hash: "NONE",
                    error: error
                };
                callback(callback_object);
            }
        });
    });
}

exports.read = function(filename, callback) {
    decompressFile(filename, (error) => {
        file_content = fs.readFileSync('./pages/' + filename + '.txt').toString();
        if (error === undefined) {
            fs.unlink('./pages/' + filename + '.txt', (err) => {
                if (err !== null)
                console.log("WARNING: Couldn't delete file './pages/" + filename + ".zip'.");
            });
            const callback_object = {
                status: "SUCCESS",
                content: file_content,
                error: "NONE"
            };
            callback(callback_object);
        }
        else {
            const callback_object = {
                status: "FAILED",
                content: "NONE",
                error: error
            };
            callback(callback_object);
        }
    });
}

function compressFile(filename, callback) {
    minify({
        compressor: htmlMinifier,
        input: './pages/' + filename + '.html',
        output: './pages/' + filename + '.html',
        callback: function(err, min) {}
    });
    compressor.gzip.compressFile('./pages/' + filename + '.html', './pages/' + filename + '.zip')
    .then(() => { 
        fs.unlink('./pages/' + filename + '.html', (err) => {
            if (err !== null)
                console.log("WARNING: Couldn't delete file './pages/" + filename + ".html'.");
        }); 
        callback(undefined);
    })
    .catch((error) => { 
        callback("Error: Couldn't decompress the file './pages/" + filename + ".zip'.");
    });
}

function decompressFile(filename, callback) {
    compressor.gzip.uncompress('./pages/' + filename + '.zip', './pages/' + filename + '.txt')
    .then(() => { 
        fs.unlink('./pages/' + filename + '.zip', (err) => {
            if (err !== null)
                console.log("WARNING: Couldn't delete file './pages/" + filename + ".zip'.");
        });
        callback(undefined);
    })
    .catch((error) => { 
        callback("Error: Couldn't decompress the file './pages/" + filename + ".zip'.");
    });
}