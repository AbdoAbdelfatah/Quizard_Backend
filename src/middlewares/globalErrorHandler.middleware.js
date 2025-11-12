import { ErrorClass } from "../utils/errorClass.util.js";

export const errorHandler = (API) => {
  return (req, res, next) => {
    API(req, res, next).catch((err) => {
      next(
        new ErrorClass(
          "Internal Server error",
          500,
          err.message,
          "Global Error Handler"
        )
      );
    });
  };
};

export const globalResponse = (err, req, res, next) => {
  if (err) {
    res.status(err.status || 500).json({
      message: "Fail response",
      err_msg: err.message,
      err_location: err.location,
      err_data: err.data,
    });
  }
};
