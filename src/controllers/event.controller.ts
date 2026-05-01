import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import Event from "../models/event.model";
import { bucket } from "../config/firebase";
import multer from "multer";

const getStorageFilePath = (imageUrl: string): string | null => {
  try {
    const parsedUrl = new URL(imageUrl);
    const prefix = `/${bucket.name}/`;
    const pathname = parsedUrl.pathname;
    if (pathname.startsWith(prefix)) {
      return pathname.slice(prefix.length);
    }
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
  } catch {
    return null;
  }
};

const deleteImageFromStorage = async (imageUrl?: string) => {
  if (!imageUrl) return;
  const filePath = getStorageFilePath(imageUrl);
  if (!filePath) return;

  try {
    await bucket.file(filePath).delete();
  } catch (error) {
    // Ignore missing file errors, but log unexpected failures.
    console.warn(`Unable to delete image from storage: ${imageUrl}`, error);
  }
};

// Multer configuration for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const { name, venue, date, description, completed } = req.body;

  if (!name || !venue || !date) {
    throw new ApiError(400, "Name, venue, and date are required");
  }

  const existingEvent = await Event.findOne({ name: name.trim() });
  if (existingEvent) {
    throw new ApiError(409, "An event with that name already exists");
  }

  let imageUrl = "";

  // Handle file upload to Firebase Storage
  if (req.file) {
    const fileName = `events/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file!.mimetype,
        },
      });

      stream.on("error", (error) => {
        reject(new ApiError(500, `Failed to upload image: ${error.message}`));
      });

      stream.on("finish", async () => {
        try {
          // Make the file publicly accessible
          await file.makePublic();
          imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(true);
        } catch (error) {
          reject(
            new ApiError(
              500,
              `Failed to make file public: ${error instanceof Error ? error.message : "Unknown error"}`,
            ),
          );
        }
      });

      stream.end(req.file!.buffer);
    });
  }

  const event = await Event.create({
    name,
    venue,
    date,
    description,
    imageUrl,
    completed: completed || false,
  });

  res.status(201).json({
    success: true,
    data: event,
    message: "Event created successfully",
  });
});

export const getAllEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const events = await Event.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "eventId",
          as: "registrations",
        },
      },
      {
        $addFields: {
          totalResponses: { $size: "$registrations" },
        },
      },
      {
        $project: {
          registrations: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: events,
    });
  },
);

export const getEventById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const event = await Event.findById(id);

    if (!event) {
      throw new ApiError(404, "Event not found");
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  },
);

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, venue, date, description, completed } = req.body;

  if (!name || !venue || !date) {
    throw new ApiError(400, "Name, venue, and date are required");
  }

  const existingEvent = await Event.findById(id);

  if (!existingEvent) {
    throw new ApiError(404, "Event not found");
  }

  const duplicateEvent = await Event.findOne({
    name: name.trim(),
    _id: { $ne: id },
  });
  if (duplicateEvent) {
    throw new ApiError(409, "An event with that name already exists");
  }

  let imageUrl = existingEvent.imageUrl;

  // Handle file upload to Firebase Storage if new file is provided
  if (req.file) {
    const fileName = `events/${Date.now()}_${req.file.originalname}`;
    const file = bucket.file(fileName);

    await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: req.file!.mimetype,
        },
      });

      stream.on("error", (error) => {
        reject(new ApiError(500, `Failed to upload image: ${error.message}`));
      });

      stream.on("finish", async () => {
        try {
          // Make the file publicly accessible
          await file.makePublic();
          imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          resolve(true);
        } catch (error) {
          reject(
            new ApiError(
              500,
              `Failed to make file public: ${error instanceof Error ? error.message : "Unknown error"}`,
            ),
          );
        }
      });

      stream.end(req.file!.buffer);
    });

    if (existingEvent.imageUrl) {
      await deleteImageFromStorage(existingEvent.imageUrl);
    }
  }

  const event = await Event.findByIdAndUpdate(
    id,
    {
      name,
      venue,
      date,
      description,
      imageUrl,
      completed: completed === "true" || completed === true,
    },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    data: event,
    message: "Event updated successfully",
  });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const event = await Event.findByIdAndDelete(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  if (event.imageUrl) {
    await deleteImageFromStorage(event.imageUrl);
  }

  res.status(200).json({
    success: true,
    message: "Event deleted successfully",
  });
});
