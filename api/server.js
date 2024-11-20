const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const path = require('path');
const app = express();


// Serve static files from the project root
app.use(express.static(path.join(__dirname, '../')))

// Load environment variables from .env file
dotenv.config();



// Middleware
app.use(express.json());  // For parsing JSON data
app.use(cors());  // Enable CORS
app.use(bodyParser.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(bodyParser.json());  // Parse JSON bodies for forms

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ,
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});



// create database
db.query('CREATE DATABASE IF NOT EXISTS expense_trucker',(err,result)=>{
    if(err){
         return console.log(err);
    }
        console.log("Database expense_trucker created/checked");
     // Use the newly created database
     db.changeUser({ database: 'expense_trucker' }, (err) => {
        if (err) {
            return console.log("Error changing database:", err);
        }
    
    // create user tables
    // const dropUsersTable= `DROP TABLE  users`;
    //     db.query(dropUsersTable,(err,result)=>{
    //         if (err){
    //              return console.log(err);
    //         }
    
    //             console.log("users table dropped");
    
    
    //     });
    const createUsersTable= `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50)NOT NULL,
    username VARCHAR(55),
    password VARCHAR(255))`;
    db.query(createUsersTable,(err,result)=>{
        if (err){
             return console.log(err);
        }

            console.log("users table checked/created");


    });


});
});


app.use(session({
    secret: process.env.SESSION_SECRET || 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Set to true if using HTTPS
}));



//user registeration route
app.post('/api/register',async(req,res)=>{
    try{
        const users = `SELECT *FROM users WHERE email = ?`
        //check if user exists
        db.query(users,[re.body.email],(err,data)=>{
            //if same user email exists in database
            if(data.length > 0) return res.status(409).json("user already exists");

            const salt = bcrypt.genSaltSync(10)
            const hashedPassword = bcrypt.hashSync(req.body.password, salt)

            const createUser = `INSERT INTO users(email,username,password) VALUES (?, ?, ?)`
            value = [
                req.body.email,
                req.body.username,
                hashedPassword
            ]
        })
        // insert user in db
        db.query(createUser,[value], (err,data) =>{
            if(err)res.status(500).json("something went wrong")
                return res.status(200).json("User created successfully");
        })
    }
    catch(err){
            res.status(500).json("Internal Server error: " + err)
        }
    
})








// Login User
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.user = user;
                    res.send('Logged in successfully!');
                } else {
                    res.status(401).send('Invalid credentials');
                }
            });
        } else {
            res.status(401).send('User not found');
        }
    });
});



// Add Expense
app.post('/add_expense', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please login to add expenses');
    }

    const { date, category, amount, description } = req.body;
    const userId = req.session.user.id;

    const sql = 'INSERT INTO expenses (user_id, date, category, amount, description) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [userId, date, category, amount, description], (err, result) => {
        if (err) throw err;
        res.send('Expense added successfully!');
    });
});



// Edit Expense
app.post('/edit_expense', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please login to edit expenses');
    }

    const { expense_id, date, category, amount, description } = req.body;

    const sql = 'UPDATE expenses SET date = ?, category = ?, amount = ?, description = ? WHERE id = ? AND user_id = ?';
    db.query(sql, [date, category, amount, description, expense_id, req.session.user.id], (err, result) => {
        if (err) throw err;
        res.send('Expense updated successfully!');
    });
});



// View Expenses
app.get('/view_expenses', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Please login to view expenses');
    }

    const sql = 'SELECT * FROM expenses WHERE user_id = ?';
    db.query(sql, [req.session.user.id], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});



// Logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.send('Logged out successfully!');
    });
});

app.listen(4000, () => {
    console.log(`Server running on port ${4000}`);
});
