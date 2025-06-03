// const express = require('express');
// const app = express()

// //USE PROXY SERVER TO REDIRECT THE INCOMMING REQUEST
// const httpProxy = require('http-proxy')
// const proxy = httpProxy.createProxyServer();

// //REDIRECT TO THE STUDENT MICROSERVICE
// app.use('/student', (req, res) => {
//     console.log("INSIDE API GATEWAY STUDENT ROUTE")
//     proxy.web(req, res, { target: 'http://184.73.78.40:5002' });
// })

// //REDIRECT TO THE TEACHER MICROSERVICE
// app.use('/teacher', (req, res) => {
//     console.log("INSIDE API GATEWAY TEACHER ROUTE")
//     proxy.web(req, res, { target: 'http://3.83.177.15:5001' });
// })

// app.listen(4000, () => {
//     console.log("API Gateway Service is running on PORT NO : ", 4000)
// })



const express = require('express');
const app = express()

//USE PROXY SERVER TO REDIRECT THE INCOMMING REQUEST
const httpProxy = require('http-proxy')
const proxy = httpProxy.createProxyServer();

const jwt = require('jsonwebtoken')
require('dotenv').config()
const JWT_SECRETE = process.env.JWT_SECRETE;

function authToken(req, res, next) {
    console.log(req.headers.authorization)
    const header = req?.headers.authorization;
    const token = header && header.split(' ')[1];

    if (token == null) return res.status(401).json("Please send token");

    jwt.verify(token, JWT_SECRETE, (err, user) => {
        if (err) return res.status(403).json("Invalid token", err);
        req.user = user;
        next()
    })
}

function authRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).json("Unauthorized");
        }
        next();
    }
}

//REDIRECT TO THE STUDENT MICROSERVICE
app.use('/student',authToken, authRole('student'), (req, res) => {
    console.log("INSIDE API GATEWAY STUDENT ROUTE")
    proxy.web(req, res, { target: 'http://3.87.14.147:5052' });
})

//REDIRECT TO THE TEACHER MICROSERVICE
app.use('/teacher', authToken, authRole('teacher'),(req, res) => {
    console.log("INSIDE API GATEWAY TEACHER ROUTE")
    proxy.web(req, res, { target: 'http://3.92.2.230:5051' });
})

//REDIRECT TO THE LOGIN(Authentication) MICROSERVICE
app.use('/auth', (req, res) => {
    proxy.web(req, res, { target: 'http://3.86.147.115:5053' });
})

app.listen(4000, () => {
    console.log("API Gateway Service is running on PORT NO : 4000")
})