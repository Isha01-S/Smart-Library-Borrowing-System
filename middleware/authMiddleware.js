const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access denied, token missing' });

    try {
        const decoded = jwt.verify(token, 'secretkey'); // same key as login
        req.user = decoded; // id & name available in req.user
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;
