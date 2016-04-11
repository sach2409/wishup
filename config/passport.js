var LocalStrategy = require('passport-local').Strategy
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../app/models/user')
var configAuth = require('./auth');

module.exports = function(passport){
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    /************************************************************************************************/
                                        /*LOCAL SIGNUP CODE*/
    /************************************************************************************************/
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },

    function(req, username, password, done) {

        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.username' :  username }, function(err, user){
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that username
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
            } else {

                // if a user with the username does not exist
                var newUser            = new User();

                newUser.local.username = username;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

    /************************************************************************************************/
                                        /*LOCAL LOGIN CODE*/
    /************************************************************************************************/
    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with username and password from our form

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login exists
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            return done(null, user); //success
        });

    }));

    /************************************************************************************************/
                                            /*FACEBOOK CODE*/
    /************************************************************************************************/

    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {

                if (err)
                    return done(err); //error connecting

                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    var newUser            = new User(); //create if not found

                    newUser.facebook.id    = profile.id;                    
                    newUser.facebook.token = token;                     
                    newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName; 
                    newUser.facebook.email = profile.emails[0].value;  // pull the first email

                    newUser.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newUser); //success saving
                    });
                }

            });
        });

    }));

    /************************************************************************************************/
                                            /*FACEBOOK CODE*/
    /************************************************************************************************/

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {

        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {

            // try to find the user based on their google id
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err); //error connecting

                if (user) {

                    return done(null, user); // user found, return that user
                } else {
                    var newUser          = new User(); //create if not found

                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser); //success saving
                    });
                }
            });
        });

    }));
};


