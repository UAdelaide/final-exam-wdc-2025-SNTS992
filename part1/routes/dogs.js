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
router.get('/', async (req, res) => {
    try {
        const[dogs] = await db.query(`
            SELECT d.dog_id, d.name, d.size, u.username As owner_username
            FROM Dogs d
            JOIN Users u ON d
        `);
        res.json(dogs);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
