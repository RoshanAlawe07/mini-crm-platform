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

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false, 
      error: "Missing authorization header" 
    });
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: "Missing token" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      googleId: decoded.googleId
    };
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      error: "Invalid or expired token" 
    });
  }
}

export default authMiddleware;