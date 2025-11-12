import User from "../models/user.model.js";
import { ErrorClass } from "../utils/errorClass.js";
import { verifyAccessToken } from "../utils/jwt.util.js";

export const auth = () => {
  return async (req, res, next) => {
    // destruct token from headers
    const { authorization } = req.headers;

    // check if token is exists
    if (!authorization) {
      return next(
        new ErrorClass("Token is required", 404, "Token is required")
      );
    }

    // retrieve original token after adding the prefix
    const originalToken = authorization.split(" ")[1];

    // verify token
    const data = verifyAccessToken(originalToken);
    // check if token payload has userId
    if (!data?.userId) {
      return next(
        new ErrorClass(
          "Invalid token payload",
          400,
          "Invalid token payload",
          "authentication.middleware.js"
        )
      );
    }
    // find user by userId
    const isUserExists = await User.findById(data?.userId).select("-password");
    if (!isUserExists) {
      return next(new ErrorClass("User not found", 404, "User not found"));
    }
    // add the user data in req object
    req.authUser = isUserExists;
    next();
  };
};
