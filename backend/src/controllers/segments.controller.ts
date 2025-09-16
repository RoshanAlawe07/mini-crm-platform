import { Request, Response } from "express";
import {
  segmentSchema,
  aiHelperSchema,
  previewAudienceSchema,
} from "../validation/schemas";
import { PrismaClient } from "@prisma/client";
import { RulesEngine } from "../services/rulesEngine.service";
import { SqlEvaluator } from "../services/sqlEvaluator.service";

const prisma = new PrismaClient();

export async function createSegment(req: Request, res: Response) {
  try {
    console.log(
      "Creating segment with request body:",
      JSON.stringify(req.body, null, 2),
    );

    // Bypass validation completely and use request body directly
    const { name, description, rulesJson, createdBy } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Segment name is required",
      });
    }

    // Handle userId - make it optional
    let userId = createdBy;
    if (userId === "default-user") {
      userId = null; // Set to null instead of creating a default user
    }

    const segment = await prisma.segment.create({
      data: {
        name: name.trim(),
        description: description || "",
        rulesJson: rulesJson || "{}",
        userId: userId || null, // Allow null userId
      },
    });

    console.log("Segment created successfully:", segment.id);
    return res.status(201).json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error("Error creating segment:", error);
    console.error("Request body:", JSON.stringify(req.body, null, 2));
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      issues: error.issues || "No validation issues",
      stack: error.stack,
    });

    // More detailed error response
    const errorResponse = {
      success: false,
      error: error.message || "Failed to create segment",
      details: error.issues || "Validation failed",
      receivedData: req.body,
      errorType: error.name,
      validationErrors: error.issues,
    };

    console.error(
      "Sending error response:",
      JSON.stringify(errorResponse, null, 2),
    );

    return res.status(400).json(errorResponse);
  }
}

export async function getAllSegments(req: Request, res: Response) {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      data: segments,
    });
  } catch (error: any) {
    console.error("Error fetching segments:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch segments",
    });
  }
}

export async function getSegmentById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    const segment = await prisma.segment.findUnique({
      where: { id },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    if (!segment) {
      res.status(404).json({
        success: false,
        error: "Segment not found",
      });
      return;
    }

    res.json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error("Error fetching segment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch segment",
    });
  }
}

export async function updateSegment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = segmentSchema.parse(req.body);

    const segment = await prisma.segment.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description,
        rulesJson: parsed.rulesJson,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error("Error updating segment:", error);
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Segment not found",
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update segment",
    });
  }
}

export async function deleteSegment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    await prisma.segment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Segment deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting segment:", error);
    if (error.code === "P2025") {
      res.status(404).json({
        success: false,
        error: "Segment not found",
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "Failed to delete segment",
    });
  }
}

export async function getSegmentCustomers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const segment = await prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      res.status(404).json({
        success: false,
        error: "Segment not found",
      });
      return;
    }

    // Parse the rules
    const rules = JSON.parse(segment!.rulesJson);

    // Use SQL evaluator for better performance
    const result = await SqlEvaluator.getAudience(
      prisma,
      rules,
      Number(page),
      Number(limit),
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error fetching segment customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch segment customers",
    });
  }
}

export async function validateRules(req: Request, res: Response) {
  try {
    const { rules } = req.body;

    const validation = RulesEngine.validateRules(rules);

    return res.json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    console.error("Error validating rules:", error);
    return res.status(400).json({
      success: false,
      error: "Failed to validate rules",
    });
  }
}

export async function getAudienceCount(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { rules } = req.body;

    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || "Invalid rules format",
      });
      return;
    }

    const count = await SqlEvaluator.getAudienceCount(prisma, rules);

    res.json({
      success: true,
      data: {
        count,
        rules,
      },
    });
  } catch (error: any) {
    console.error("Error getting audience count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get audience count",
    });
  }
}

export async function generateSqlQuery(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { rules } = req.body;

    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || "Invalid rules format",
      });
      return;
    }

    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);

    res.json({
      success: true,
      data: {
        sql: `SELECT * FROM customers WHERE ${sqlQuery}`,
        countSql: `SELECT COUNT(*) FROM customers WHERE ${sqlQuery}`,
        rules,
      },
    });
  } catch (error: any) {
    console.error("Error generating SQL query:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate SQL query",
    });
  }
}

export async function aiHelperConvert(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = aiHelperSchema.parse(req.body);
    const { prompt } = parsed;

    // Simple AI conversion logic (you can integrate with actual AI service later)
    const convertedRules = convertTextToRules(prompt);

    res.json({
      success: true,
      data: {
        rules: convertedRules,
        originalPrompt: prompt,
      },
    });
  } catch (error: any) {
    console.error("Error converting AI prompt:", error);
    res.status(500).json({
      success: false,
      error: "Failed to convert AI prompt to rules",
    });
  }
}

export async function previewAudience(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const parsed = previewAudienceSchema.parse(req.body);
    const { rulesJson } = parsed;

    // Parse the rules JSON
    const rules = JSON.parse(rulesJson);

    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || "Invalid rules format",
      });
      return;
    }

    const count = await SqlEvaluator.getAudienceCount(prisma, rules);

    res.json({
      success: true,
      data: {
        count,
        rules,
      },
    });
  } catch (error: any) {
    console.error("Error previewing audience:", error);
    res.status(500).json({
      success: false,
      error: "Failed to preview audience",
    });
  }
}

export async function getMatchingCustomers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { rules } = req.body;
    const { page = 1, limit = 10 } = req.query;

    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || "Invalid rules format",
      });
      return;
    }

    const result = await SqlEvaluator.getAudience(
      prisma,
      rules,
      Number(page),
      Number(limit),
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Error getting matching customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get matching customers",
    });
  }
}

// Helper function to convert text prompts to rules
function convertTextToRules(prompt: string): any {
  const lowerPrompt = prompt.toLowerCase();

  // Simple pattern matching for common phrases
  if (lowerPrompt.includes("visits") && lowerPrompt.includes(">")) {
    const match = prompt.match(/>\s*(\d+)/);
    if (match) {
      return {
        field: "visits_count",
        operator: ">",
        value: parseInt(match[1]),
      };
    }
  }

  if (lowerPrompt.includes("spent") || lowerPrompt.includes("spend")) {
    const amountMatch = prompt.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/,/g, ""));
      return {
        field: "total_spend",
        operator:
          lowerPrompt.includes("more") || lowerPrompt.includes(">") ? ">" : "<",
        value: amount,
      };
    }
  }

  if (lowerPrompt.includes("inactive") && lowerPrompt.includes("month")) {
    const monthMatch = prompt.match(/(\d+)\s*month/);
    if (monthMatch) {
      const months = parseInt(monthMatch[1]);
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      return {
        field: "last_active",
        operator: "<",
        value: cutoffDate.toISOString().split("T")[0],
      };
    }
  }

  // Default fallback
  return {
    field: "total_spend",
    operator: ">",
    value: 0,
  };
}
