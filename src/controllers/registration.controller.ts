import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import Registration from "../models/registration.model";

// Create a new registration
export const createRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId, surname, firstName, middleName, ...registrationData } =
      req.body;

    if (!eventId) {
      res.status(400);
      throw new Error("Event ID is required");
    }

    const existingRegistration = await Registration.findOne({
      eventId,
      surname: surname?.trim(),
      firstName: firstName?.trim(),
      middleName: middleName?.trim() || "",
    });

    if (existingRegistration) {
      throw new ApiError(
        409,
        "A registration with this name already exists for the selected event",
      );
    }

    const registration = await Registration.create({
      eventId,
      surname: surname?.trim(),
      firstName: firstName?.trim(),
      middleName: middleName?.trim() || "",
      ...registrationData,
      registrationDate: new Date(),
    });

    res.status(201).json({
      message: "Registration created successfully",
      data: registration,
    });
  },
);

// Get all registrations for an event
export const getRegistrationsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const { eventId } = req.params;

    const registrations = await Registration.find({ eventId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Registrations retrieved successfully",
      data: registrations,
    });
  },
);

// Get a specific registration
export const getRegistrationById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const registration = await Registration.findById(id);

    if (!registration) {
      res.status(404);
      throw new Error("Registration not found");
    }

    res.status(200).json({
      message: "Registration retrieved successfully",
      data: registration,
    });
  },
);

// Update a registration
export const updateRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { eventId, surname, firstName, middleName, ...rest } = req.body;

    if (eventId && surname && firstName) {
      const duplicate = await Registration.findOne({
        eventId,
        surname: surname.trim(),
        firstName: firstName.trim(),
        middleName: middleName?.trim() || "",
        _id: { $ne: id },
      });
      if (duplicate) {
        throw new ApiError(
          409,
          "A registration with this name already exists for the selected event",
        );
      }
    }

    const updateData = {
      ...req.body,
      surname: surname?.trim(),
      firstName: firstName?.trim(),
      middleName: middleName?.trim() || "",
      ...rest,
    };

    const registration = await Registration.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!registration) {
      res.status(404);
      throw new Error("Registration not found");
    }

    res.status(200).json({
      message: "Registration updated successfully",
      data: registration,
    });
  },
);

// Delete a registration
export const deleteRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const registration = await Registration.findByIdAndDelete(id);

    if (!registration) {
      res.status(404);
      throw new Error("Registration not found");
    }

    res.status(200).json({
      message: "Registration deleted successfully",
      data: registration,
    });
  },
);

// Get all registrations (admin)
export const getAllRegistrations = asyncHandler(
  async (req: Request, res: Response) => {
    const registrations = await Registration.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "All registrations retrieved successfully",
      data: registrations,
    });
  },
);
