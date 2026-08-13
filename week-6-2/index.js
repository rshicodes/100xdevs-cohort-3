const express = require('express');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "rishi124";

const app = express();
app.use(express.json());

const users = [];

app.get("/", logger, (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/signup", logger, (req, res) => {
    const { username, password } = req.body;
    users.push({ username, password });

    res.json({ message: "User registered successfully" });
});

app.post("/login", logger, (req, res) => {
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, JWT_SECRET);
    res.json({ token });
});

function auth(req, res, next) {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decodedData = jwt.verify(token, JWT_SECRET);

        if (decodedData.username) {
            req.username = decodedData.username;
            next();
        } else {
            res.status(401).json({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
}

function logger(req, res, next) {
    console.log(`${req.method} ${req.url}`);
    next();
}

app.get("/me", logger, auth, (req, res) => {
    let foundUser = null;

    for(let i = 0; i < users.length; i++) {
        if(users[i].username === req.username) {
            foundUser = users[i];
            break;
        }
    }

    if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ username: foundUser.username });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});