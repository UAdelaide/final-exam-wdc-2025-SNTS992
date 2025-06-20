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
            SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
            FROM WalkRequests wr
            JOIN Users u ON d.owner_id = u.user_id
            JOIN Dogs d ON wr.dog_id = d.dog_id
            WHERE wr.status = 'open'
        `);
        res.json(open);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
