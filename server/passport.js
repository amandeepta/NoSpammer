const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require('./models/User')
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "http://localhost:5000/auth/google/callback",
			scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.modify"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ googleId: profile.id });
		
				if (!user) {
					// Create new user if not found
					user = new User({
						googleId: profile.id,
						accessToken: accessToken,
						refreshToken : refreshToken
					});
				} else {
					// Update token if user already exists
					user.accessToken = accessToken;
					user.refreshToken = refreshToken
				}
		
				// Save user to database
				await user.save();
		
				// Pass user object to Passport
				return done(null, user);
			} catch (err) {
				console.error('Error storing user:', err);
				return done(err, null);
			}
		}));

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});
