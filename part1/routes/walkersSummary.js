var express = require('express');
var router = express.Router();
const mysql = require('mysql2'); // use mysql in application
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
}).promise();

/* Get summary of each walker */
router.get('/', async (req, res) => {
    try {
        const[summary] = await db.query(`
            SELECT d.dog_id, d.name, d.size, u.username As owner_username
            FROM Dogs d
            JOIN Users u ON d.owner_id = u.user_id
        `);
        res.json(summary);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
