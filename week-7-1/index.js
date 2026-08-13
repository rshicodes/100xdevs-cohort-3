const express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "rishirishirishi";
const mongoose = require('mongoose');
const { UserModel, TodoModel } = require('./db.js');
const dns = require('dns');

dns.setServers(['1.1.1.1', '8.8.8.8']); // Set DNS servers to Cloudflare and Google

mongoose.connect('mongodb+srv://erenmikasayeager9_db_user:jFsPAOcOUU2svTcA@cluster0.y2ljw3h.mongodb.net/todoapp', {});

const app = express();
app.use(express.json());

app.post('/signup', async (req, res) => {
    const { email, password, name } = req.body;

    await UserModel.create({
        email,
        password,
        name
    });

    res.json({ message: 'User created successfully' });
});

app.post('/signin', async (req, res) => {
    const { email, password } = req.body; 

    const user = await UserModel.findOne({
        email,
        password
    });

    if (user) {
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    }else{
        res.status(403).json({
            message: "invalid credentials"
        })
    }
})

app.post('/todo', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const { title, done } = req.body;

    await TodoModel.create({
        title,
        done,
        userId
    });
    
    res.json({ message: 'Todo created successfully' });
})

app.get('/todos', authenticateToken, async (req, res) => {
    const userId = req.userId;
    const todos = await TodoModel.find({ userId });
    res.json({ todos });
})

function authenticateToken(req, res, next) {
    const token = req.headers.token;
    
    const decodedData = jwt.verify(token, JWT_SECRET);

    if (decodedData) {
        req.userId = decodedData.id;
        next();
    }else{
        res.status(403).json({
            message: "invalid token"
        })
    }
}

app.listen(3000, () => {
    console.log("app is running on port 3000")
})