var express = require('express');
var router = express.Router();
const mysql = require('mysql2'); // use mysql in application
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
}).promise();

/* Get list of dogs with their size and owner's username */
router.get('/', function (req, res) {
    res.send('respond with a resource');
});

module.exports = router;
