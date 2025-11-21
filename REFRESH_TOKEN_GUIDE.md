# Refresh Token Implementation Guide

## Overview

A complete refresh token system has been implemented for the user authentication flow. This allows users to obtain new access tokens without needing to log in again when their access token expires.

**Security Enhancement**: Refresh tokens are stored in **secure HTTP-only cookies** to prevent XSS attacks from accessing them.

## Features

### 1. **Refresh Token Middleware** (`refreshToken.middleware.js`)

- Validates refresh tokens from secure HTTP-only cookies (primary)
- Falls back to Authorization header (Bearer token) if needed
- Proper error handling for expired or invalid tokens
- Stores decoded user information in `req.user` for use in controllers

### 2. **Updated Login Endpoint**

- Returns `accessToken` only (refresh token stored in HTTP-only cookie)
- Refresh token valid for 7 days (access token valid for 1 day)
- Cookie is automatically sent with all requests (secure, httpOnly, sameSite)

### 3. **New Refresh Token Endpoint**

- Route: `POST /api/v1/users/refresh-token`
- Reads refresh token from HTTP-only cookie automatically
- Rotates refresh token on each use (new token set in cookie)
- Returns new `accessToken` only (new refresh token in cookie)

## API Usage

### Login Request

```json
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response

```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user"
}
```

**Note**: Refresh token is automatically set in `Set-Cookie` header as HTTP-only cookie.

### Refresh Token Request

```
POST /api/v1/users/refresh-token
Cookie: refreshToken=<token> (automatically sent by browser)
```

### Refresh Token Response

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: New refresh token is automatically set in `Set-Cookie` header as HTTP-only cookie.

## Implementation Details

### Token Expiration

- **Access Token**: 1 day (used for API requests)
- **Refresh Token**: 7 days (stored in HTTP-only cookie)

### Cookie Configuration

- **httpOnly**: `true` - Prevents JavaScript access (XSS protection)
- **secure**: `true` (production only) - HTTPS only
- **sameSite**: `strict` - CSRF protection
- **maxAge**: 7 days
- **path**: `/` - Available to all routes

### Frontend Implementation (Recommended)

```javascript
// 1. Login - tokens are automatically managed via cookies
const loginResponse = await fetch("/api/v1/users/login", {
  method: "POST",
  credentials: "include", // Important: Include cookies
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),

// 2. Use accessToken for API requests
const apiResponse = await fetch("/api/v1/users", {
  credentials: "include",
  headers: { Authorization: `Bearer ${sessionStorage.getItem("accessToken")}` },
});

// 3. If API returns 401 (token expired), refresh token
if (apiResponse.status === 401) {
  const refreshResponse = await fetch("/api/v1/users/refresh-token", {
    method: "POST",
    credentials: "include", // Refresh token sent automatically in cookie
  });

  if (refreshResponse.ok) {
    const { accessToken: newAccessToken } = await refreshResponse.json();

    // Update access token in sessionStorage
    sessionStorage.setItem("accessToken", newAccessToken);
    // Refresh token is automatically updated in cookie by server

    // Retry original request with new token
    // ...
  } else {
    // Refresh failed - redirect to login
    window.location.href = "/login";
  }
}
```

## Error Responses

### Invalid/Expired Refresh Token

```json
{
  "success": false,
  "message": "Refresh token has expired. Please login again.",
  "statusCode": 401
}
```

### Missing Refresh Token

```json
{
  "success": false,
  "message": "Refresh token is required. Please login again.",
  "statusCode": 401
}
```

## Security Considerations

1. **HTTP-Only Cookies**: Refresh tokens are stored in HTTP-only cookies that cannot be accessed by JavaScript (XSS protection)
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **SameSite Strict**: CSRF protection prevents token from being sent with cross-site requests
4. **Token Rotation**: Each refresh request returns a new refresh token (automatic rotation)
5. **Expiration**: Tokens automatically expire after their duration
6. **Validation**: All tokens are verified using JWT secrets
7. **Access Token**: Keep access token in memory/sessionStorage only (never localStorage)
8. **Logout**: Clear sessionStorage and server-side sessions on logout

## Frontend Best Practices

1. **Use `credentials: "include"`** in fetch/axios to include cookies
2. **Never expose refresh tokens** in URLs or request bodies
3. **Store access token in memory** or sessionStorage only
4. **Implement automatic token refresh** before expiration
5. **Handle 401 responses** by refreshing and retrying
6. **Clear storage on logout** and redirect to login

## Files Modified/Created

1. **Created**: `src/middlewares/refreshToken.middleware.js` - Refresh token validation middleware (reads from HTTP-only cookies)
2. **Updated**: `src/modules/user/user.controller.js` - Updated loginUser and refreshAccessToken to use cookies
3. **Updated**: `src/modules/user/user.route.js` - Added refresh-token route with middleware
4. **Existing**: `src/utils/jwt.util.js` - Already had generateRefreshToken and verifyRefreshToken functions
