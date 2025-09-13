import { Request, Response } from "express";
import { campaignSchema } from "../validation/schemas";
import { PrismaClient } from '@prisma/client';
import { SqlEvaluator } from '../services/sqlEvaluator.service';
import { campaignQueue } from '../queues';

const prisma = new PrismaClient();

export async function createCampaign(req: Request, res: Response) {
  try {
    // For now, use a default user ID. In a real app, this would come from auth middleware
    const defaultUserId = 'default-user-id';
    
    const campaign = await prisma.campaign.create({
      data: {
        name: req.body.name,
        userId: defaultUserId,
        status: "DRAFT", // or "SCHEDULED"
        rulesJson: req.body.rules_json, // keep rules for later
        segmentId: req.body.segmentId,
        messageTemplate: req.body.messageTemplate,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create campaign',
    });
  }
}

export async function getAllCampaigns(req: Request, res: Response) {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            rulesJson: true,
          }
        },
        communicationLogs: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          }
        }
      }
    });

    res.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
    });
  }
}

export async function getCampaignById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: {
          select: {
            id: true,
            name: true,
            rulesJson: true,
          }
        },
        communicationLogs: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
      return;
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign',
    });
  }
}

export async function updateCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parsed = campaignSchema.parse(req.body);
    
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        name: parsed.name,
        messageTemplate: parsed.messageTemplate,
        scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
        segmentId: parsed.segmentId,
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update campaign',
    });
  }
}

export async function deleteCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    await prisma.campaign.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign',
    });
  }
}

export async function getCampaignAudience(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: true
      }
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    if (!campaign.segment) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no associated segment',
      });
    }

    // Parse the segment rules
    const rules = JSON.parse(campaign.segment.rulesJson);
    
    // Use SQL evaluator to get audience
    const result = await SqlEvaluator.getAudience(
      prisma,
      rules,
      Number(page),
      Number(limit)
    );
    
    res.json({
      success: true,
      data: {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          segment: campaign.segment.name,
        },
        audience: result,
      },
    });
  } catch (error: any) {
    console.error('Error fetching campaign audience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign audience',
    });
  }
}

export async function launchCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        segment: true
      }
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    if (!campaign.segment) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no associated segment',
      });
    }

    if (!campaign.messageTemplate) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no message template',
      });
    }

    // Parse the segment rules
    const rules = JSON.parse(campaign.segment.rulesJson);
    
    // Get all customers matching the segment rules
    const audience = await SqlEvaluator.getAudience(prisma, rules, 1, 10000); // Get up to 10k customers
    
    if (audience.customers.length === 0) {
      res.json({
        success: true,
        message: 'No customers match the segment criteria',
        data: {
          campaignId: campaign.id,
          audienceCount: 0,
          messagesCreated: 0,
        },
      });
    }

    // Create communication log entries for each customer
    const communicationLogs = audience.customers.map(customer => ({
      campaignId: campaign.id,
      customerId: customer.id,
      message: campaign.messageTemplate || 'Default message',
      status: 'PENDING',
      attempts: 0,
    }));

    await prisma.communicationLog.createMany({
      data: communicationLogs,
    });

    // Update campaign status
    await prisma.campaign.update({
      where: { id },
      data: {
        updatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Campaign launched successfully',
      data: {
        campaignId: campaign.id,
        audienceCount: audience.customers.length,
        messagesCreated: communicationLogs.length,
      },
    });
  } catch (error: any) {
    console.error('Error launching campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to launch campaign',
    });
  }
}

export async function getCampaignStats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        communicationLogs: true
      }
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    const stats = {
      total: campaign.communicationLogs.length,
      pending: campaign.communicationLogs.filter(log => log.status === 'PENDING').length,
      sent: campaign.communicationLogs.filter(log => log.status === 'SENT').length,
      failed: campaign.communicationLogs.filter(log => log.status === 'FAILED').length,
    };

    res.json({
      success: true,
      data: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        stats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign stats',
    });
  }
}

export async function sendCampaign(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    
    // Get campaign with rules
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) {
      res.status(404).json({
        success: false,
        error: 'Campaign not found',
      });
    }

    if (!campaign.rulesJson) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no rules defined',
      });
    }

    // Parse rules and query matching customers
    const rules = JSON.parse(campaign.rulesJson);
    const audience = await SqlEvaluator.getAudience(prisma, rules, 1, 10000); // Get up to 10k customers
    
    if (audience.customers.length === 0) {
      res.json({
        success: true,
        message: 'No customers match the campaign criteria',
        data: {
          campaignId: campaign.id,
          customersProcessed: 0,
          messagesCreated: 0,
        },
      });
    }

    // Create communication logs and enqueue delivery jobs
    const results = [];
    
    for (const customer of audience.customers) {
      const log = await prisma.communicationLog.create({
        data: {
          customerId: customer.id,
          campaignId: campaign.id,
          status: "PENDING",
          messageId: require('crypto').randomUUID(),
          message: campaign.messageTemplate || 'Default message',
        },
      });

      await campaignQueue.add("deliverMessage", {
        campaignId: campaign.id,
        customerId: customer.id,
        messageId: log.messageId,
      });

      results.push({
        customerId: customer.id,
        messageId: log.messageId,
      });
    }

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: {
        campaignId: campaign.id,
        customersProcessed: audience.customers.length,
        messagesCreated: results.length,
        results,
      },
    });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send campaign',
    });
  }
}

