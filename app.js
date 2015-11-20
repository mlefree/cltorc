var express = require('express');
var app = express();

console.log("server launched");
app.use(express.static(__dirname + '/app'));
app.listen(process.env.PORT || 8080);