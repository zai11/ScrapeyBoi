const ScrapeyBoi = require('./ScrapeyBoi');
const express = require('express');
const app = express();
app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.get('/scrape/:address', function(req, res) {
    let address = req.params.address;
    ScrapeyBoi.scrape(address, (result) => {
        res.json(result);
    });
    //res.send('This is working');
});
app.get('/fetch/:hash', function(req, res) {
    let hash = req.params.hash;
    ScrapeyBoi.read(hash, (result) => {
        res.json(result)
    });
});
app.listen(process.env.PORT || 4000, function () {
  console.log('Example app listening on port 4000!');
});