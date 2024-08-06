const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');

//server static files
app.use(express.static('api'));


//midlewares
app.use(express.json());
app.use(cors());
dotenv.config();
// define routes
app.get('/register',(request,response)=>{
    response.sendFile(path.join(__dirname,'register.html'));
});

// connecting to database
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD
  

});

//test connection
db.connect((err)=> {
if(err) {
        return console.log("Error connecting to MYSQL");
}
        // if connection works
console.log("connected to MYSQL as id:",db.threadId);
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
        const createUsersTable= `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(50)NOT NULL,
        password VARCHAR(255))`;
        db.query(createUsersTable,(err,result)=>{
            if (err){
                 return console.log(err);
            }

                console.log("users table checked/created");


        })


    });
});

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

            const createUser = `INSERT INTO users(email,username,password) VALUES (?)`
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
            res.status(500).json("Internal Server error")
        }
    
})
// user login route
app.post('/api/login',async(req,res)=>{
    try{
        const users = `SELECT*FROM users WHERE email = ?`
        db.query(users,[req.body.email],(err,date) =>{
            if(date.length ===0) return res.status(404).json("user not found")
                // check if pasword is valid
            const isPasswordValid = bcrypt.compareSync(req.body.password, data[0].password)
            if(!isPasswordValid) return res.status(400).jadon('Invalidemail or password')
               return res.status(200).json("Login successful") 

        })
    }
    catch(err) {
        res.status(500).json("Internal server error")
    }
})
 
// start server
app.listen(4000,()=> {
    console.log("server is running on port 4000");
});
