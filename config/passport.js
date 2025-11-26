const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongodb = require('../data/database');

module.exports = function (passport) {
  const googleID = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallback = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

  console.log('[passport] Google OAuth Configuration:');
  console.log('[passport]   Client ID:', googleID ? '✓ present' : '✗ MISSING');
  console.log('[passport]   Client Secret:', googleSecret ? '✓ present' : '✗ MISSING');
  console.log('[passport]   Callback URL:', googleCallback);

  if (googleID && googleSecret) {
    try {
      passport.use(
        new GoogleStrategy(
          { 
            clientID: googleID, 
            clientSecret: googleSecret, 
            callbackURL: googleCallback 
          },
          async (accessToken, refreshToken, profile, done) => {
            try {
              const db = mongodb.getDatabase();
              const users = db.collection('users');
              
              // Find or create user
              let user = await users.findOne({ googleId: profile.id });
              if (!user) {
                const newUser = {
                  googleId: profile.id,
                  displayName: profile.displayName || 'Unknown',
                  email: profile.emails?.[0]?.value || null,
                  createdAt: new Date()
                };
                const result = await users.insertOne(newUser);
                user = { _id: result.insertedId, ...newUser };
                console.log('[passport] Created new Google user:', user._id);
              } else {
                console.log('[passport] Found existing Google user:', user._id);
              }
              
              return done(null, user);
            } catch (err) {
              console.error('[passport] Error in Google verify:', err.message);
              return done(err);
            }
          }
        )
      );
      console.log('[passport] ✓ Google strategy configured');
    } catch (err) {
      console.error('[passport] ✗ Failed to configure Google strategy:', err.message);
    }
  } else {
    console.error('[passport] ✗ Google credentials missing');
  }

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const db = mongodb.getDatabase();
      const user = await db.collection('users').findOne({ _id: require('mongodb').ObjectId(id) });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
