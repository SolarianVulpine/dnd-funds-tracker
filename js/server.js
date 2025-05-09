// server.js
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

const storage = new Storage();
const bucket = storage.bucket(process.env.STORAGE_BUCKET);

// Middleware for authentication
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });
        req.user = ticket.getPayload();
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        // Generate JWT for subsequent requests
        const jwtToken = jwt.sign({
            sub: payload.sub,
            email: payload.email
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token: jwtToken });
    } catch (error) {
        res.status(401).json({ error: 'Invalid authentication token' });
    }
});

// Party data endpoint
app.get('/api/party/:partyId', authenticate, async (req, res) => {
    try {
        const file = bucket.file(`parties/${req.params.partyId}.json`);
        const [data] = await file.download();
        res.json(JSON.parse(data.toString()));
    } catch (error) {
        res.status(404).json({ error: 'Party not found' });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});