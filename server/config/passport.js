const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID || 'place_holder_id',
                clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'place_holder_secret',
                callbackURL: '/api/auth/google/callback', // Relative paths can sometimes cause issues with proxies
                // BETTER:
                callbackURL: 'http://localhost:5001/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await User.findOne({ googleId: profile.id });

                    if (user) {
                        return done(null, user);
                    } else {
                        // Check if user exists by email (to merge accounts)
                        const existingEmailUser = await User.findOne({ email: profile.emails[0].value });

                        if (existingEmailUser) {
                            // Link accounts
                            existingEmailUser.googleId = profile.id;
                            if (!existingEmailUser.isVerified) existingEmailUser.isVerified = true;
                            if (!existingEmailUser.profilePic) existingEmailUser.profilePic = profile.photos[0].value;
                            await existingEmailUser.save();
                            return done(null, existingEmailUser);
                        }

                        // Create new user
                        const newUser = {
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000), // Generate temp username
                            profilePic: profile.photos[0].value,
                            isVerified: true
                        };

                        user = await User.create(newUser);
                        done(null, user);
                    }
                } catch (err) {
                    console.error(err);
                    done(err, null);
                }
            }
        )
    );
};
