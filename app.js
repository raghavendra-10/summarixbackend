const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require('./db');
const authRoutes = require('./routes/auth');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const { ExtractJwt, Strategy: JwtStrategy } = passportJWT;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

app.use(passport.initialize());

// Use auth routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected-route', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ msg: 'You have accessed a protected route!', user: req.user });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 8001;
const HOST = '0.0.0.0'; // Allow connections from any IP address

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
