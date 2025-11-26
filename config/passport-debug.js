const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongodb = require('../data/database');

// Debug wrapper to capture exact OAuth error responses
class DebugGoogleStrategy extends GoogleStrategy {
  _oauth2_getOAuthAccessToken(code, params, callback) {
    console.log('[passport-debug] Exchanging authorization code for token...');
    const self = this;
    
    // Wrap callback to capture error details
    const wrappedCallback = (err, accessToken, refreshToken, results) => {
      if (err) {
        console.error('[passport-debug] ❌ Token exchange FAILED');
        console.error('[passport-debug] Error message:', err.message);
        console.error('[passport-debug] Error code:', err.code);
        if (err.data) {
          console.error('[passport-debug] Error response body:', err.data);
          try {
            const parsed = JSON.parse(err.data);
            console.error('[passport-debug] Parsed error:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            // Not JSON
          }
        }
      } else {
        console.log('[passport-debug] ✓ Token exchange SUCCESS');
      }
      callback(err, accessToken, refreshToken, results);
    };
    
    // Call parent's token exchange with wrapped callback
    super._oauth2_getOAuthAccessToken(code, params, wrappedCallback);
  }
}

module.exports = function (passport) {
  const googleID = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleCallback = process.env.GOOGLE_CALLBACK_URL || `https://${process.env.RENDER_HOST || 'cse-341-project2-1dsv.onrender.com'}/auth/google/callback`;

  // Startup diagnostics
  console.log('\n[passport] ========== GOOGLE OAUTH CONFIGURATION ==========');
  console.log('[passport] Client ID present:', !!googleID);
  console.log('[passport] Client Secret present:', !!googleSecret);
  console.log('[passport] Callback URL:', googleCallback);
  console.log('[passport] ====================================================\n');

  if (googleID && googleSecret) {
    try {
      passport.use(
        new DebugGoogleStrategy(
          { 
            clientID: googleID, 
            clientSecret: googleSecret, 
            callbackURL: googleCallback 
          },
          async (accessToken, refreshToken, profile, done) => {
            console.log('[passport] ✓ User authenticated via Google. Profile ID:', profile.id);
            try {
              const db = mongodb.getDatabase();
              const users = db.collection('users');
              let user = await users.findOne({ googleId: profile.id });
              if (!user) {
                console.log('[passport] Creating new user from Google profile...');
                const newUser = {
                  googleId: profile.id,
                  displayName: profile.displayName,
                  email: (profile.emails && profile.emails[0] && profile.emails[0].value) || null,
                  createdAt: new Date()
                };
                const r = await users.insertOne(newUser);
                newUser._id = r.insertedId;
                user = newUser;
                console.log('[passport] ✓ New user created:', user._id);
              } else {
                console.log('[passport] ✓ Existing user found:', user._id);
              }
              return done(null, user);
            } catch (err) {
              console.error('[passport] ❌ Error in verify callback:', err.message);
              return done(err);
            }
          }
        )
      );
      console.log('[passport] ✓ Google strategy configured successfully.');
    } catch (err) {
      console.error('[passport] ❌ Failed to configure Google strategy:', err.message);
    }
  } else {
    console.error('[passport] ❌ Google credentials NOT provided:');
    console.error('   - GOOGLE_CLIENT_ID:', googleID ? 'present' : 'MISSING');
    console.error('   - GOOGLE_CLIENT_SECRET:', googleSecret ? 'present' : 'MISSING');
  }

  // Session serializers
  passport.serializeUser((user, done) => {
    console.log('[passport] Serializing user:', user._id);
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const db = mongodb.getDatabase();
      const u = await db.collection('users').findOne({ _id: require('mongodb').ObjectId(id) });
      console.log('[passport] Deserialized user:', id, '→', u ? 'found' : 'not found');
      done(null, u);
    } catch (err) {
      console.error('[passport] ❌ Deserialize error:', err.message);
      done(err);
    }
  });
};
