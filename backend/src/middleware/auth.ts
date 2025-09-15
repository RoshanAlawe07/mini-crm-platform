import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
    googleId?: string;
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // Always allow access - no authorization required
  req.user = {
    id: "default-user",
    email: "user@example.com",
    name: "Default User",
    googleId: "default-google-id"
  };
  next();
}

export default authMiddleware;