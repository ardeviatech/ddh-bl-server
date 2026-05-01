import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "../utils/tokens";
import { Model } from "mongoose";

const DEFAULT_REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: DEFAULT_REFRESH_MAX_AGE,
  });
};

// const clearRefreshTokens = async (token: string) => {
//   const hashed = hashToken(token);
//   await Promise.all([
//     User.findOneAndUpdate({ refresh_token: hashed }, { refresh_token: "" }),
//     AdminAccount.findOneAndUpdate(
//       { refresh_token: hashed },
//       { refresh_token: "" },
//     ),
//   ]);
// };

const sendAuthResponse = async (
  model: Model<any>,
  userId: string,
  res: Response,
) => {
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);
  const accessToken = generateAccessToken(userId);

  let query = model
    .findByIdAndUpdate(
      userId,
      { refresh_token: hashedRefreshToken },
      { returnDocument: "after" },
    )
    .select("-password -refresh_token -_id -__v");

  const updatedUser = await query;
  setRefreshTokenCookie(res, refreshToken);

  return { accessToken, updatedUser };
};

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body || {};

    if (!username || !password) {
      throw new ApiError(400, "Username and password are required");
    }

    const user = await User.findOne({ username });

    if (!user) {
      throw new ApiError(404, "Incorrect username or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Incorrect username or password");
    }

    // Here you would typically generate a JWT token
    // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

    const { accessToken, updatedUser } = await sendAuthResponse(
      User,
      user._id.toString(),
      res,
    );

    res.json({
      message: "Login successful",
      data: {
        accessToken,
        user: updatedUser,
      },
    });
  },
);
export const refresh = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.cookies;

    if (!refresh_token) {
      throw new ApiError(401, "Refresh token not found");
    }

    const hashedToken = hashToken(refresh_token);
    const user = await User.findOne({ refresh_token: hashedToken });

    if (!user) {
      throw new ApiError(403, "Invalid refresh token");
    }

    // Generate new tokens
    const newRefreshToken = generateRefreshToken();
    const hashedNewRefreshToken = hashToken(newRefreshToken);
    const accessToken = generateAccessToken(user._id.toString());

    // Update user with new refresh token
    await User.findByIdAndUpdate(user._id, {
      refresh_token: hashedNewRefreshToken,
    });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      message: "Token refreshed",
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          access: user.access,
        },
      },
    });
  },
);

// LOGOUT
export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.cookies;

    if (refresh_token) {
      const hashedToken = hashToken(refresh_token);
      await User.findOneAndUpdate(
        { refresh_token: hashedToken },
        { refresh_token: "" },
      );
    }

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    res.json({ message: "Logged out successfully" });
  },
);
