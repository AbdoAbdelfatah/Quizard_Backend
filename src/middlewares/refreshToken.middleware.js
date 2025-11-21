import { verifyRefreshToken } from "../utils/jwt.util.js";
import { ErrorClass } from "../utils/errorClass.util.js";

/**
 * Middleware to verify refresh token from httpOnly cookie
 * Automatically extracts refresh token from cookies
 * Falls back to Authorization header (Bearer token) if cookie not present
 */
export const refreshTokenAuth = (req, res, next) => {
  try {
    let refreshToken;

    // Check httpOnly cookie first (primary method)
    if (req.cookies?.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }
    // Check Authorization header as fallback (Bearer token)
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      refreshToken = req.headers.authorization.substring(7);
    }

    if (!refreshToken) {
      return next(
        new ErrorClass(
          "Refresh token is required. Please login again.",
          401,
          null,
          "refreshTokenAuth"
        )
      );
    }

    const decoded = verifyRefreshToken(refreshToken);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new ErrorClass(
          "Refresh token has expired. Please login again.",
          401,
          null,
          "refreshTokenAuth"
        )
      );
    }
    if (error.name === "JsonWebTokenError") {
      return next(
        new ErrorClass(
          "Invalid refresh token. Please login again.",
          401,
          null,
          "refreshTokenAuth"
        )
      );
    }
    next(
      new ErrorClass(
        "Failed to verify refresh token",
        500,
        error.message,
        "refreshTokenAuth"
      )
    );
  }
};
