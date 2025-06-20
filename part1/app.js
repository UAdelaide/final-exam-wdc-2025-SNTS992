var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let db;

(async () => {
    try {
        // Connect to MySQL without specifying a database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '' // Set your MySQL root password
        });

        // Create the database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
        await connection.end();

        // Connect to the created database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'DogWalkService'
        });

        // Create a table if it doesn't exist
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Dogs (
                dog_id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                name VARCHAR(50) NOT NULL,
                size ENUM('small', 'medium', 'large') NOT NULL,
                FOREIGN KEY (owner_id) REFERENCES Users(user_id)
            );
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS WalkRequests (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.execute(`
            CREATE TABLE IF NOT EXISTS Users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('owner', 'walker') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Insert Users data if table is empty
        const [userRows] = await db.execute('SELECT COUNT(*) AS count FROM Users');
        if (userRows[0].count === 0) {
            await db.execute(`
            INSERT INTO Users (username, email, password_hash, role)
            VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('johnysm', 'johnsmith@example.com', 'hashed666', 'walker'),
            ('kevpat', 'kevinpatel@example.com', 'hashed888', 'owner');
            `);
        }

        // Insert Dogs data if table is empty
        const [dogRows] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
        if (dogRows[0].count === 0) {
            await db.execute(`
            INSERT INTO Dogs (name, size, owner_id)
            VALUES
            ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
            ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
            ('Shaq', 'large', (SELECT user_id FROM Users WHERE username = 'johnysm')),
            ('Lebron', 'medium', (SELECT user_id FROM Users WHERE username = 'kevpat')),
            ('Daisy', 'small', (SELECT user_id FROM Users WHERE username = 'alice123'));
            `);
        }

        // Insert Dogs data if table is empty
        const [walkRows] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
        if (walkRows[0].count === 0) {
            await db.execute(`
            INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
            VALUES
            ((SELECT dog_id FROM Dogs WHERE username = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE username = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE username = 'Shaq'), '2025-06-11 08:00:00', 35, 'Adelaide', 'cancelled'),
            ((SELECT dog_id FROM Dogs WHERE username = 'Daisy'), '2025-06-11 09:15:00', 30, 'Norwood', 'completed'),
            ((SELECT dog_id FROM Dogs WHERE username = 'Lebron'), '2025-06-12 10:00:00', 60, 'Glenelg', 'open');
            `);
        }
    } catch (err) {
        console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
    }
})();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
