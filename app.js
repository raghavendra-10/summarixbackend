const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('./db');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('./models/user'); // Ensure the path is correct for your project structure
const session = require('express-session');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize()); // Initialize passport before routes
const authRoutes = require('./routes/auth');
const audioRoutes = require('./routes/audioroute')

app.use(session({
  secret: 'SecretKey', // Replace with a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));
// Passport JWT configuration
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      if (jwtPayload) {
        return done(null, jwtPayload);
      } else {
        return done(null, false);
      }
    }
  )
);

// Passport Google OAuth configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://summarix.toystack.dev/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile:', profile); // Log Google profile for debugging

        // Find or create the user based on Google profile
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // If the user doesn't exist, create a new user
          user = new User({
            email: profile.emails[0].value,
            googleId: profile.id,
            isVerified: true, // Assume Google users are verified
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        console.error('Error during Google OAuth strategy:', err); // Log error for debugging
        return done(err, false);
      }
    }
  )
);

// Auth routes
app.get(
  '/api/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate a JWT token for the authenticated user
    try {
      const token = jwt.sign(req.user.toJSON(), process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      console.error('Error generating JWT:', err); // Log error for debugging
      res.status(500).send('Server error');
    }
  }
);

// Use additional auth routes from a separate file

app.use('/api/auth', authRoutes);
app.use('/audio', audioRoutes);
// Protected route example
app.get('/api/protected-route', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ msg: 'You have accessed a protected route!', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack); // Log unhandled errors
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 8001;
// const HOST = '0.0.0.0';
const HOST = '192.168.29.51'; // Allow connections from any IP address

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
