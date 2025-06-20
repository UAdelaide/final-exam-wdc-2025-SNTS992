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
            SELECT u.username AS walker,
                COUNT(DISTINCT wr.rating_id) AS total_rating,
                AVG(wr.rating) AS average_rating
                COUNT(DISTINCT completed_wr.request_id) AS completed_walks
            FROM Users u
            LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
            LEFT JOIN WalkApplications wa ON u.user_id = wa.walker_id
            LEFT JOIN WalkRequests completed_wr ON wa.request_id = completed_wr.request_id AND completed_wr.status = 'completed'
            WHERE u.role = 'walker'
            GROUP BY u.user_id
        `);
        res.json(summary);
    } catch(err){
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
