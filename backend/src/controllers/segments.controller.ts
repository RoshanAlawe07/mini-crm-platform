import { Request, Response } from "express";
import { segmentSchema } from "../validation/schemas";
import { PrismaClient } from '@prisma/client';
import { RulesEngine } from '../services/rulesEngine.service';
import { SqlEvaluator } from '../services/sqlEvaluator.service';

const prisma = new PrismaClient();

export async function createSegment(req: Request, res: Response) {
  try {
    const parsed = segmentSchema.parse(req.body);
    
    const segment = await prisma.segment.create({
      data: {
        name: parsed.name,
        rulesJson: parsed.rulesJson,
        createdBy: parsed.createdBy,
      },
    });

    res.status(201).json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error('Error creating segment:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create segment',
    });
  }
}

export async function getAllSegments(req: Request, res: Response) {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        campaigns: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: segments,
    });
  } catch (error: any) {
    console.error('Error fetching segments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch segments',
    });
  }
}

export async function getSegmentById(req: Request, res: Response): Promise<void> {
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
          }
        }
      }
    });

    if (!segment) {
      res.status(404).json({
        success: false,
        error: 'Segment not found',
      });
    }

    res.json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error('Error fetching segment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch segment',
    });
  }
}

export async function updateSegment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = segmentSchema.parse(req.body);
    
    const segment = await prisma.segment.update({
      where: { id },
      data: {
        name: parsed.name,
        rulesJson: parsed.rulesJson,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: segment,
    });
  } catch (error: any) {
    console.error('Error updating segment:', error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Segment not found',
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update segment',
    });
  }
}

export async function deleteSegment(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    await prisma.segment.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Segment deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting segment:', error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Segment not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete segment',
    });
  }
}

export async function getSegmentCustomers(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const segment = await prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      res.status(404).json({
        success: false,
        error: 'Segment not found',
      });
    }

    // Parse the rules
    const rules = JSON.parse(segment!.rulesJson);
    
    // Use SQL evaluator for better performance
    const result = await SqlEvaluator.getAudience(
      prisma,
      rules,
      Number(page),
      Number(limit)
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching segment customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch segment customers',
    });
  }
}

export async function validateRules(req: Request, res: Response) {
  try {
    const { rules } = req.body;
    
    const validation = RulesEngine.validateRules(rules);
    
    res.json({
      success: true,
      data: validation,
    });
  } catch (error: any) {
    console.error('Error validating rules:', error);
    res.status(400).json({
      success: false,
      error: 'Failed to validate rules',
    });
  }
}

export async function getAudienceCount(req: Request, res: Response): Promise<void> {
  try {
    const { rules } = req.body;
    
    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid rules format',
      });
    }

    const count = await SqlEvaluator.getAudienceCount(prisma, rules);
    
    res.json({
      success: true,
      data: {
        count,
        rules
      },
    });
  } catch (error: any) {
    console.error('Error getting audience count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get audience count',
    });
  }
}

export async function generateSqlQuery(req: Request, res: Response): Promise<void> {
  try {
    const { rules } = req.body;
    
    // Validate rules first
    const validation = SqlEvaluator.validateRulesForSql(rules);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        error: validation.error || 'Invalid rules format',
      });
    }

    const sqlQuery = SqlEvaluator.rulesToSqlString(rules);
    
    res.json({
      success: true,
      data: {
        sql: `SELECT * FROM customers WHERE ${sqlQuery}`,
        countSql: `SELECT COUNT(*) FROM customers WHERE ${sqlQuery}`,
        rules
      },
    });
  } catch (error: any) {
    console.error('Error generating SQL query:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate SQL query',
    });
  }
}
