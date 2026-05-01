import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";


export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  role: string;
  access: string[];
  refresh_token?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
    access: { type: [String], default: [] },
    refresh_token: { type: String },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // Only hash if password is new or modified
  if (!this.isModified("password")) return;

  const saltRounds = 10;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

export const User = model<IUser>("User", userSchema);
