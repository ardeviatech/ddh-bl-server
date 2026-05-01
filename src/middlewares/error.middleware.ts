import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ApiError } from "../utils/ApiError";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: any = undefined;

  /* ---------------------------------- */
  /* Custom ApiError                    */
  /* ---------------------------------- */
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  /* ---------------------------------- */
  /* Mongoose Validation Error          */
  /* ---------------------------------- */
  else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
  }

  /* ---------------------------------- */
  /* MongoDB Duplicate Key Error        */
  /* ---------------------------------- */
  else if (err.code === 11000) {
  statusCode = 409;

  const duplicateFields = Object.keys(err.keyValue || {});

  const isPatientDuplicate =
    duplicateFields.includes("firstname") &&
    duplicateFields.includes("middlename") &&
    duplicateFields.includes("lastname") &&
    duplicateFields.includes("birthDate");

  message = isPatientDuplicate
    ? "Patient already exists"
    : `Duplicate value for field(s): ${duplicateFields.join(", ")}`;
}

  /* ---------------------------------- */
  /* Mongoose Cast Error (ObjectId)     */
  /* ---------------------------------- */
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  /* ---------------------------------- */
  /* Multer Errors (File Upload)        */
  /* ---------------------------------- */
  else if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size too large";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field";
    } else {
      message = err.message;
    }
  }

  /* ---------------------------------- */
  /* Default Error                     */
  /* ---------------------------------- */
  else if (err instanceof Error) {
    message = err.message;
  }

  /* ---------------------------------- */
  /* Response                          */
  /* ---------------------------------- */
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
