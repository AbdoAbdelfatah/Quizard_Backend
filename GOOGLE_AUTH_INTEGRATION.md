# Google Authentication Integration Guide

## Frontend Setup

### Issue: "Invalid token format" or "Wrong number of segments in token"

**Root Cause:** The frontend is sending the **access token** instead of the **ID token** from Google OAuth response.

### Solution: Use Google Sign-In Library Correctly

#### 1. Install Google Sign-In Library

```bash
npm install @react-oauth/google
```

#### 2. Setup Google Provider in App

```typescript
// App.tsx or App.js
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}

export default App;
```

Add to `.env`:

```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
```

#### 3. Google Login Button Component

```typescript
// components/GoogleLoginButton.tsx
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface GoogleCredentialResponse {
  clientId: string;
  credential: string; // This is the ID Token ✓
}

const GoogleLoginButton = () => {
  const { login } = useAuth();

  const handleGoogleLogin = async (
    credentialResponse: GoogleCredentialResponse
  ) => {
    try {
      // credentialResponse.credential is the ID Token ✓
      // NOT the access token
      const idToken = credentialResponse.credential;

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/users/google`,
        {
          token: idToken, // Send ID Token to backend
        }
      );

      // Extract tokens from response
      const { token: accessToken, user, isNewUser } = response.data;

      // Store access token in sessionStorage
      sessionStorage.setItem("accessToken", accessToken);

      // Store user data
      localStorage.setItem("user", JSON.stringify(user));

      // Login successful
      login(user, accessToken);

      if (isNewUser) {
        // Redirect to profile completion
        window.location.href = "/complete-profile";
      } else {
        // Redirect to dashboard
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Failed to login with Google");
    }
  };

  const handleGoogleError = () => {
    console.error("Google login error");
    alert("Failed to login with Google");
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={handleGoogleError}
        theme="outline"
        size="large"
        text="signin_with"
      />
    </div>
  );
};

export default GoogleLoginButton;
```

#### 4. Alternative: Manual Google Sign-In Setup

If not using `@react-oauth/google` library:

```typescript
// Manually handle Google Sign-In
import { jwtDecode } from "jwt-decode";

export const initGoogleSignIn = () => {
  google.accounts.id.initialize({
    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
  });

  google.accounts.id.renderButton(
    document.getElementById("google-signin-button"),
    {
      theme: "outline",
      size: "large",
      text: "signin_with",
    }
  );
};

export const handleCredentialResponse = async (response: any) => {
  // response.credential is the ID Token ✓
  const idToken = response.credential;

  // Optionally decode to verify (for development)
  const decoded = jwtDecode(idToken);
  console.log("Decoded ID Token:", decoded);

  try {
    // Send ID Token to backend
    const authResponse = await fetch(
      `${process.env.REACT_APP_API_URL}/users/google`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: idToken, // ID Token ✓
        }),
      }
    );

    const data = await authResponse.json();

    if (data.success) {
      // Store tokens
      sessionStorage.setItem("accessToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect based on isNewUser
      if (data.isNewUser) {
        window.location.href = "/complete-profile";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Google auth error:", error);
  }
};
```

#### 5. Login Page Example

```typescript
// pages/LoginPage.tsx
import React from "react";
import GoogleLoginButton from "../components/GoogleLoginButton";

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Welcome to Quizard</h1>
        <p>Choose your login method</p>

        {/* Google Login */}
        <div className="google-login-section">
          <h3>Quick Login</h3>
          <GoogleLoginButton />
        </div>

        {/* Traditional Email Login */}
        <div className="email-login-section">
          <h3>Or login with email</h3>
          {/* Your existing email login form */}
        </div>

        {/* Sign Up Link */}
        <p className="signup-link">
          Don't have an account? <a href="/register">Sign up here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

### Key Points

✅ **Correct:** Send `credentialResponse.credential` (ID Token)

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20ifQ..."
}
```

❌ **Incorrect:** Don't send `access_token` (Longer, starts with `ya29`)

```json
{
  "token": "ya29.A0ATi6K2utghZtA7j_19zRKmyGr2KOluAyMyGSPC9YrA3gqlp5ZTq8lNQCaecNnfRMzy0H8W8QXyuTU8KHMfTEBuljz..."
}
```

### Token Comparison

| Aspect                   | ID Token                          | Access Token        |
| ------------------------ | --------------------------------- | ------------------- |
| **Purpose**              | User authentication               | API authorization   |
| **Contains User Info**   | ✅ Yes (email, name, photo, etc.) | ❌ No (opaque)      |
| **Used For**             | Login/Auth                        | API calls           |
| **Segments**             | 3 (header.payload.signature)      | 3-4 (varies)        |
| **Backend Verification** | `verifyIdToken()`                 | Requires Google API |

### Environment Variables

Create `.env.local` in your frontend:

```
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:3000/api/v1
```

### Troubleshooting

#### Error: "Invalid Google token: client is not defined"

- **Cause:** Backend issue (already fixed)
- **Solution:** Update backend to latest version

#### Error: "Wrong number of segments in token"

- **Cause:** Sending access_token instead of id_token
- **Solution:** Use `credentialResponse.credential` not `access_token`

#### Error: "Invalid Google token: Invalid token"

- **Cause:** Token expired or tampered
- **Solution:** Re-authenticate with Google

#### CORS Error

- **Cause:** Frontend and backend on different origins
- **Solution:** Add frontend URL to Google OAuth redirect URIs

### Backend Response

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "isNewUser": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "photoURL": "https://...",
    "isConfirmed": true,
    "role": "user"
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "message": "Fail response",
  "err_msg": "Internal Server error",
  "err_data": "Invalid Google token: ...",
  "err_location": "Global Error Handler"
}
```

### Next Steps

1. Update frontend to use ID Token
2. Test Google login on staging
3. Monitor for auth errors
4. Handle token refresh with refresh token endpoint
