/**
 * @file passportConfig.js
 * @description Passport.js configuration for Google OAuth2 authentication
 * @requires passport
 * @requires passport-google-oauth2
 * @requires dotenv
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { userModel } = require('./usermodel');
require('dotenv').config();

/**
 * Environment variables validation
 * @throws {Error} If required environment variables are missing
 */
const requiredEnvVars = [
  'GOOGLE_AUTH_CLIENT_ID',
  'GOOGLE_CREDENTIALS_SECRET',
  'BACKEND_URL'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

/**
 * Serializes user data for the session
 * Stores only the user ID in the session
 * 
 * @param {Object} user - User object
 * @param {Function} done - Passport callback
 */
passport.serializeUser(async (user, done) => {
  done(null, user.id);
});

/**
 * Deserializes user data from the session
 * Retrieves complete user object using the stored ID
 * 
 * @param {string} id - User ID
 * @param {Function} done - Passport callback
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findOne({ id: id });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Log backend URL for debugging
console.log(`Backend URL: ${process.env.BACKEND_URL}`);

/**
 * Google OAuth2 Strategy Configuration
 * Handles user authentication and creation/update
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CREDENTIALS_SECRET,
  callbackURL: `${process.env.BACKEND_URL}/google/callback`,
  passReqToCallback: true
}, 
/**
 * Google Strategy callback
 * Handles user verification and database operations
 * 
 * @async
 * @param {Object} request - Express request object
 * @param {string} accessToken - OAuth2 access token
 * @param {string} refreshToken - OAuth2 refresh token
 * @param {Object} profile - User profile from Google
 * @param {Function} done - Passport callback
 * @returns {Promise<void>}
 */
async function(request, accessToken, refreshToken, profile, done) {
  try {
    console.log("Processing Google OAuth Strategy");
    
    // Extract primary email from profile
    const email = profile.emails[0].value;
    
    // Find and update or create new user
    const user = await userModel.findOneAndUpdate(
      { id: profile.id },
      { 
        $set: { 
          email: email,
          name: profile.displayName,
          lastUpdated: new Date()
        } 
      },
      { 
        upsert: true,
        new: true // Returns the updated document
      }
    );
    
    console.log(`User ${user ? 'updated' : 'created'}: ${profile.displayName}`);
    
    // Return user data for session
    return done(null, {
      name: profile.displayName,
      id: profile.id,
      email: email
    });
    
  } catch (error) {
    console.error('Google Strategy Error:', error);
    return done(error);
  }
}));

/**
 * Error handling middleware for Passport
 */
passport.use('error', (error, req, res, next) => {
  console.error('Passport Error:', error);
  res.status(500).json({ error: 'Authentication failed' });
});

module.exports = passport;