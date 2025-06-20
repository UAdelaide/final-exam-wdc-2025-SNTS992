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
            SELECT u.username AS walker, COUNT(wr.rating_id) AS total_rating,
                AVG(wr.rating) AS average_rating
            FROM Users u
            JOIN Users u ON d.owner_id = u.user_id
        `);
        res.json(summary);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
