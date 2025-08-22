'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();

const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'student_mentor',
    DB_CONN_LIMIT = 10,
} = process.env;

const pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: Number(DB_CONN_LIMIT),
    queueLimit: 0,
    namedPlaceholders: true,
});

async function getConnection() {
    return pool.getConnection();
}

async function query(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows;
}

module.exports = {
    pool,
    getConnection,
    query,
};


