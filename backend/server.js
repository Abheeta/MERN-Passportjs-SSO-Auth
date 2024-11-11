/**
 * Express.js Server with Google OAuth2 Authentication
 * 
 * This server implements Google OAuth2 authentication using Passport.js and includes
 * session management with MongoDB storage. It provides endpoints for authentication,
 * user account management, and session handling.
 * 
 * Required Environment Variables:
 * - GOOGLE_CREDENTIALS_SECRET: Secret for session management
 * - MONGO_URL: MongoDB connection string
 * - LOCAL_FRONTEND: Frontend application URL
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./passport.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(
    cors({
        origin: [
            'http://localhost:3006',
            'http://localhost:8000'
        ],
        credentials: true,
    })
);

app.set('trust proxy', 1);

// CORS Headers Middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', `${process.env.LOCAL_FRONTEND}`);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Session Configuration
 * Uses MongoDB store for persistent session storage
 * Cookie configuration is set for development environment
 * For production: set secure: true and sameSite: 'none'
 */
app.use(session({
    secret: `${process.env.GOOGLE_CREDENTIALS_SECRET}SESSION_SECRET`,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax', // Use 'none' in production with secure: true
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
    })
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

/**
 * Routes
 */

// Test Route
app.get("/", (req, res) => {
    console.log('SESSION', req.session);
    console.log('sessionID', req.sessionID);
    console.log('USER', req.user);
});

// Authentication Failed Route
app.get("/failed", (req, res) => {
    res.send("Failed");
});

// Authentication Success Route
app.get("/success", (req, res) => {
    res.redirect(`Welcome ${req.user.email}`);
});

/**
 * Google OAuth Routes
 */

// Initiates Google OAuth flow
app.get('/google',
    passport.authenticate('google', {
        scope: ['email', 'profile'],
        keepSessionInfo: true
    })
);

// Google OAuth callback handler
app.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/failed',
        keepSessionInfo: true
    }),
    function(req, res) {
        console.log(req.user + " HERE'S THE AUTHENTICATED USER");
        res.redirect(`${process.env.LOCAL_FRONTEND}/home`);
    }
);

/**
 * Account Management Routes
 */

// Get user account information
app.get("/account", (req, res) => {
    console.log(req.user + "ACCOUNT ROUTE");
    if (req.user) {
        const user = {
            ...req.user,
            loggedIn: true,
        };
        res.json(user);
    } else {
        res.json({ loggedIn: false });
    }
});

// Logout route
app.get('/logout', function(req, res) {
    console.log("logout");
    req.logout((err) => {
        if (err) {
            res.json({ message: err });
        } else {
            const user = {
                ...req.user,
                loggedIn: false,
            };
            res.json(user);
        }
    });
});

/**
 * Database Connection
 */
const mongoConnectionString = process.env.MONGO_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoConnectionString, {
            dbName: "template-mern-google-oauth2-passport",
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

// Start server after database connection
connectDB().then(() => {
    app.listen(8000, () => {
        console.log("listening for requests");
    });
});