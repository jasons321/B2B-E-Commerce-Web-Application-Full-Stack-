


const mysql = require('mysql');

//Source: youtube.com/watch?v=hGZX_SA7lYg - setting up database and connection to nodeJS
var connection = mysql.createConnection({
    host: "localhost",
    connectionLimit:10,
    user: "root",
    //.env indicates that the password was stored locally 
    password: process.env.DATABASE_PASSWORD,
    database: "order",
    port: 3306
})

module.exports = connection

