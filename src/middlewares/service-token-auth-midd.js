
const express = require('express');
const OAuth2Client = require('google-auth-library').OAuth2Client;
const app = express();
const port = 3000;
app.use(express.json());

// 1. Initialize the client
const client = new OAuth2Client();

// 2. THIS IS THE CRITICAL PART
// This MUST exactly match the `BACKEND_AUDIENCE` you set in your Python script.
const BACKEND_AUDIENCE = 'this endpoint we will choose it tegother, consider it as your key to google to get the service token'; 

/**
 * Express middleware to authenticate a Google OIDC Identity Token.
 */
async function authenticateService(req, res, next) {
  // 3. Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Service-Token ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed token' });
  }

  const token = authHeader.split(' ')[1];// the token coming from the mcp server, we want to make sure that it is right

  try {
    // 4. Verify the token
    // This one function does EVERYTHING:
    // - Checks signature
    // - Checks expiration
    // - Checks issuer
    // - Checks audience
    const ticket = await client.verifyIdToken({// here we verify the token
        idToken: token,// the mcp token
        audience: BACKEND_AUDIENCE, // this is a constant between us
    });

    // 5. Success! Attach the payload to the request for your routes to use
    const payload = ticket.getPayload();

    // You can now trust this payload. The email identifies the service account.
    req.serviceAccountEmail = payload.email; 
    
    next(); // Move on to the actual route handler

  } catch (error) {
    // 6. Handle failure
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}