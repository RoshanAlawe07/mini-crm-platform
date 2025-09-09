import { Request, Response } from "express";
import { customerSchema } from "../validation/schemas";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createCustomer(req: Request, res: Response) {
  try {
    const parsed = customerSchema.parse(req.body);
    
    // For testing without Redis, create customer directly
    const customer = await prisma.customer.upsert({
      where: { email: parsed.email },
      update: {
        name: parsed.name,
        phone: parsed.phone,
        totalSpend: parsed.total_spend || 0,
        lastActive: parsed.last_active ? new Date(parsed.last_active) : null,
        visitsCount: parsed.visits_count || 0,
      },
      create: {
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        totalSpend: parsed.total_spend || 0,
        lastActive: parsed.last_active ? new Date(parsed.last_active) : null,
        visitsCount: parsed.visits_count || 0,
      },
    });
    
    return res.status(201).json({ 
      message: "Customer created successfully", 
      customer: {
        id: customer.id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalSpend: customer.totalSpend,
        lastActive: customer.lastActive,
        visitsCount: customer.visitsCount,
        createdAt: customer.createdAt
      }
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.errors || err.message });
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const { 
      page = '1', 
      limit = '10', 
      spend_gt, 
      spend_lt, 
      visits_gt, 
      visits_lt,
      search,
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for filtering
    const where: any = {};

    if (spend_gt) {
      where.totalSpend = { ...where.totalSpend, gte: parseFloat(spend_gt as string) };
    }
    if (spend_lt) {
      where.totalSpend = { ...where.totalSpend, lte: parseFloat(spend_lt as string) };
    }
    if (visits_gt) {
      where.visitsCount = { ...where.visitsCount, gte: parseInt(visits_gt as string, 10) };
    }
    if (visits_lt) {
      where.visitsCount = { ...where.visitsCount, lte: parseInt(visits_lt as string, 10) };
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sort_by as string] = sort_order as string;

    // Get customers with pagination
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          totalSpend: true,
          lastActive: true,
          visitsCount: true,
          createdAt: true
        }
      }),
      prisma.customer.count({ where })
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
