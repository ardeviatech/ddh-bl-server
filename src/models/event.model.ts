import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  name: string;
  venue: string;
  date: string;
  description?: string;
  imageUrl?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    venue: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    completed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IEvent>("Event", eventSchema);
