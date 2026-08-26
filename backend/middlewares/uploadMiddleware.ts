import { NextFunction, Request, Response } from "express";
import multer from "multer";

// Mirrors the constraints the dropzone widget advertises in the UI. Those were
// previously the *only* check - a raw multipart request straight at the AI
// service bypassed them entirely - so they're enforced here as well.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(new Error("UNSUPPORTED_FILE_TYPE"));
            return;
        }
        cb(null, true);
    },
});

// Wraps multer so its failures become the same JSON error shape as the rest of
// the API instead of falling through to the generic 500 handler.
export const uploadSinglePhoto = (field: string) => (req: Request, res: Response, next: NextFunction): void => {
    upload.single(field)(req, res, (err: unknown) => {
        if (!err) {
            next();
            return;
        }
        if (err instanceof multer.MulterError) {
            const message = err.code === "LIMIT_FILE_SIZE"
                ? "That photo is larger than the 10 MB limit."
                : "That upload could not be read. Send a single image file.";
            res.status(400).json({ message });
            return;
        }
        if (err instanceof Error && err.message === "UNSUPPORTED_FILE_TYPE") {
            res.status(400).json({ message: "Only JPG and PNG photos are supported." });
            return;
        }
        next(err);
    });
};
