// src/utils/tokens.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const generateAccessToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "15m",
  });

export const generateRefreshToken = () =>
  crypto.randomBytes(64).toString("hex");

export const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");
