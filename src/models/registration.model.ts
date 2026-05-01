import mongoose, { Document, Schema } from "mongoose";

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  surname: string;
  firstName: string;
  middleName?: string;
  birthday: string;
  age: number;
  sex: string;
  civilStatus?: string;
  nationality?: string;
  barangay?: string;
  town?: string;
  province?: string;
  education?: string;
  religion?: string;
  bloodType?: string;
  mobileNumber?: string;
  telephone?: string;
  email?: string;
  identificationType?: string;
  identificationNumber?: string;
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    surname: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    birthday: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    civilStatus: {
      type: String,
    },
    nationality: {
      type: String,
    },
    barangay: {
      type: String,
    },
    town: {
      type: String,
    },
    province: {
      type: String,
    },
    education: {
      type: String,
    },
    religion: {
      type: String,
    },
    bloodType: {
      type: String,
    },
    mobileNumber: {
      type: String,
    },
    telephone: {
      type: String,
    },
    email: {
      type: String,
    },
    identificationType: {
      type: String,
    },
    identificationNumber: {
      type: String,
    },
    registrationDate: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);
registrationSchema.index(
  { eventId: 1, surname: 1, firstName: 1, middleName: 1 },
  { unique: true, name: "unique_event_registration_name" },
);
const Registration =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", registrationSchema);

export default Registration;
