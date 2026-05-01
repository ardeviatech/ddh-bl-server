import { Request, Response } from "express";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, password, role, access } = req.body || {};

  if (!name || !username || !password) {
    throw new ApiError(400, "Name, username, and password are required");
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(400, "Username already exists");
  }

  const newUser = await User.create({
    name,
    username,
    password,
    role: role || "staff",
    access: access || [],
  });

  res.json(newUser);
});
