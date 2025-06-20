var express = require('express');
var router = express.Router();
const mysql = require('mysql2'); // use mysql in application
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DogWalkService'
}).promise();

/* Get list of all open request */
router.get('/', async (req, res) => {
    try {
        const[open] = await db.query(`
            SELECT wr.request_id, d.name, d.size, u.username As owner_username
            FROM WalkRequests wr
            JOIN Users u ON d.owner_id = u.user_id
        `);
        res.json(open);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
