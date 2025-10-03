import { Request, Response } from "express";
import {
  segmentSchema,
  aiHelperSchema,
  previewAudienceSchema,
} from "../validation/schemas";
import { PrismaClient } from '@prisma/client';
import { SqlEvaluator } from '../services/sqlEvaluator.service';

const prisma = new PrismaClient();

export async function createSegment(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, rules, rulesJson } = req.body;
    const userId = (req as any).user?.id;

    const validation = segmentSchema.safeParse({
      name,
      description,
      rulesJson: rulesJson || "{}",
    });

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.issues,
      });
      return;
    }

    const segment = await prisma.segment.create({
      data: {
        name,
        description: description || "",
        rulesJson: rulesJson || "{}",
        userId: userId || null,
      },
    });

    console.log(`Segment created: ${segment.id} - ${segment.name}`);

    res.status(201).json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error("Error creating segment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create segment",
      details: error.message,
    });
  }
}

export async function getAllSegments(req: Request, res: Response): Promise<void> {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: segments,
    });
  } catch (error: any) {
    console.error("Error fetching segments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch segments",
      details: error.message,
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
      details: error.message,
    });
  }
}

export async function updateSegment(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;
    const { name, description, rulesJson } = req.body;

    const segment = await prisma.segment.update({
      where: { id },
      data: {
        name,
        description,
        rulesJson: rulesJson || "{}",
      },
    });

    res.json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error("Error updating segment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update segment",
      details: error.message,
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
    res.status(500).json({
      success: false,
      error: "Failed to delete segment",
      details: error.message,
    });
  }
}

export async function getSegmentCustomers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

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

    const rules = JSON.parse(segment.rulesJson || "{}");
    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);

    const customers = await prisma.$queryRawUnsafe(sqlQuery);

    res.json({
      success: true,
      data: customers,
    });
  } catch (error: any) {
    console.error("Error fetching segment customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch segment customers",
      details: error.message,
    });
  }
}

export async function validateRules(req: Request, res: Response): Promise<void> {
  try {
    const { rules } = req.body;

    if (!rules) {
      res.status(400).json({
        success: false,
        error: "Rules are required",
      });
      return;
    }

    const validation = SqlEvaluator.validateRulesForSql(rules);
    const isValid = validation.isValid;

    res.json({
      success: true,
      valid: isValid,
      error: validation.error,
    });
  } catch (error: any) {
    console.error("Error validating rules:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate rules",
      details: error.message,
    });
  }
}

export async function getAudienceCount(req: Request, res: Response): Promise<void> {
  try {
    const { rulesJson } = req.body;

    if (!rulesJson) {
      res.status(400).json({
        success: false,
        error: "Rules JSON is required",
      });
      return;
    }

    const rules = JSON.parse(rulesJson);
    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);
    const countQuery = `SELECT COUNT(*) as count FROM (${sqlQuery}) as subquery`;

    const result = await prisma.$queryRawUnsafe(countQuery);
    const count = (result as any)[0]?.count || 0;

    res.json({
      success: true,
      count: parseInt(count),
    });
  } catch (error: any) {
    console.error("Error getting audience count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get audience count",
      details: error.message,
    });
  }
}

export async function generateSqlQuery(req: Request, res: Response): Promise<void> {
  try {
    const { rules } = req.body;

    if (!rules) {
      res.status(400).json({
        success: false,
        error: "Rules are required",
      });
      return;
    }

    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);

    res.json({
      success: true,
      sqlQuery,
    });
  } catch (error: any) {
    console.error("Error generating SQL query:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate SQL query",
      details: error.message,
    });
  }
}

export async function aiHelperConvert(req: Request, res: Response): Promise<void> {
  try {
    const { query, prompt } = req.body;

    const validation = aiHelperSchema.safeParse({ query, prompt });
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.issues,
      });
      return;
    }

    res.json({
      success: true,
      message: "AI helper conversion not yet implemented",
      query,
      prompt,
    });
  } catch (error: any) {
    console.error("Error in AI helper conversion:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process AI helper request",
      details: error.message,
    });
  }
}

export async function previewAudience(req: Request, res: Response): Promise<void> {
  try {
    const { rulesJson, rules } = req.body;

    const validation = previewAudienceSchema.safeParse({ rulesJson });
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Invalid input data",
        details: validation.error.issues,
      });
      return;
    }

    const rulesToUse = rules || JSON.parse(rulesJson);
    const sqlQuery = SqlEvaluator.rulesToSqlString(rulesToUse);

    const previewQuery = `${sqlQuery} LIMIT 10`;
    const customers = await prisma.$queryRawUnsafe(previewQuery);

    const countQuery = `SELECT COUNT(*) as count FROM (${sqlQuery}) as subquery`;
    const result = await prisma.$queryRawUnsafe(countQuery);
    const totalCount = (result as any)[0]?.count || 0;

    res.json({
      success: true,
      data: {
        customers,
        totalCount: parseInt(totalCount),
        sqlQuery,
      },
    });
  } catch (error: any) {
    console.error("Error previewing audience:", error);
    res.status(500).json({
      success: false,
      error: "Failed to preview audience",
      details: error.message,
    });
  }
}

export async function getMatchingCustomers(req: Request, res: Response): Promise<void> {
  try {
    const { rules } = req.body;

    if (!rules) {
      res.status(400).json({
        success: false,
        error: "Rules are required",
      });
      return;
    }

    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);

    const customers = await prisma.$queryRawUnsafe(sqlQuery);

    res.json({
      success: true,
      data: customers,
      sqlQuery,
    });
  } catch (error: any) {
    console.error("Error getting matching customers:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get matching customers",
      details: error.message,
    });
  }
}