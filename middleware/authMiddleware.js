const { User } = require('../models/userModel');

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log("Authorization Header:", req.headers.authorization);

    if (!authHeader || !authHeader.startsWith("Bearer ")) return res.status(401).send({ message: 'Access Denied. No token provided.' });

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY);
        const user = await User.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        
        res.status(400).send({ message: 'Invalid token' });
    }
};

module.exports = auth;