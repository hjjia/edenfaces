var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;
var hostname = 'www.edenfaces.com';

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port);
console.log(`server is running at http://${hostname}:${port}`);
