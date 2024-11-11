const GoogleStrategy = require('passport-google-oauth2').Strategy;
const passport = require('passport');
const { userModel } = require('./usermodel');
require('dotenv').config();


passport.serializeUser(async(user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
    try{
        const user = await userModel.findOne({id:id});
        done(null, user);
    } catch (error) {
        done (error, null);

    }
    // done(null, id);
});
console.log(`${process.env.BACKEND_URL}`)

passport.use(new GoogleStrategy({
    clientID: `${process.env.GOOGLE_AUTH_CLIENT_ID}`,
    clientSecret:  `${process.env.GOOGLE_CREDENTIALS_SECRET}`,
    callbackURL: `${process.env.BACKEND_URL}/google/callback`,
    passReqToCallback: true
}, async function(request, accessToken, refreshToken, profile, done) {
    try {
        console.log("STRATEGY CODE")
        const email = profile.emails[0].value;
        
        // console.log(existingUser);
            // User doesn't exist, create a new one
            console.log("IM HEREEE")
            const newUser = await userModel.findOneAndUpdate(
                { id: profile.id },
                { $set: { email: email, name: profile.displayName } },
                { upsert: true },
            );
            console.log(newUser+ "IM THE NEW USERRRRRRRR");
        // await newUser.save(); // Assuming userModel has a save method
            
        return done(null, {name: profile.displayName, id: profile.id, email:profile.emails[0].value});
        // if (existingUser.source !== "google") {
        //     // User exists but signed up with a different method
        //     return done(null, false, {
        //         message: 'You have previously signed up with a different sign-in method'
        //     });
        // }
        
        // // Update lastVisited timestamp for existing Google user
        // existingUser.lastVisited = new Date();
        // await newUser.save(); // Assuming userModel has a save method

    } catch (err) {
        return done(err);
    }
}));

module.exports = passport;



