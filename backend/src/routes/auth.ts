import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Google OAuth callback
router.post("/google", async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required Google profile data"
      });
    }

    let user = await prisma.user.findUnique({
      where: { googleId }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
          picture
        }
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          email,
          name,
          picture
        }
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        googleId: user.googleId
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        },
        token
      }
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed"
    });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: "Missing authorization header"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    return res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }
});

// Logout (client-side token removal)
router.post("/logout", (req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});

export default router;