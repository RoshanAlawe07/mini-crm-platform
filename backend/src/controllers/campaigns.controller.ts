import { Request, Response } from "express";
import { campaignSchema } from "../validation/schemas";
import { PrismaClient } from '@prisma/client';
import { SqlEvaluator } from '../services/sqlEvaluator.service';
// import { campaignQueue } from '../queues'; // Disabled for now

const prisma = new PrismaClient();

// Helper function to generate unique messageId
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to create communication log safely
async function createCommunicationLog(data: any) {
  try {
    return await prisma.communicationLog.create({
      data: {
        ...data,
        messageId: data.messageId || generateMessageId()
      }
    });
  } catch (error: any) {
    // If messageId column doesn't exist, try without it
    if (error.code === 'P2022' && error.meta?.column === 'messageId') {
      console.log('⚠️  messageId column not found, creating log without it');
      const { messageId, ...dataWithoutMessageId } = data;
      return await prisma.communicationLog.create({
        data: dataWithoutMessageId
      });
    }
    throw error;
  }
}

// Simulate message sending with realistic success/failure rates
async function simulateMessageSending(campaignId: string, customerIds: string[], messageTemplate: string) {
  const communicationLogs = [];
  
  for (const customerId of customerIds) {
    // Simulate realistic failure rate (around 10-15%)
    const isSuccess = Math.random() > 0.12; // 88% success rate
    const status = isSuccess ? 'SENT' : 'FAILED';
    
    const log = await createCommunicationLog({
      campaignId,
      customerId,
      message: messageTemplate,
      status,
      attempts: 1,
      lastAttemptAt: new Date(),
      deliveryReceipt: isSuccess ? JSON.stringify({ delivered: true, timestamp: new Date() }) : JSON.stringify({ error: 'Delivery failed' })
    });
    
    communicationLogs.push(log);
  }
  
  return communicationLogs;
}

export async function createCampaign(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from request (should be set by auth middleware)
    const userId = (req as any).user?.id || req.body.userId;
    
    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required to create a campaign'
      });
      return;
    }
    
    // Validate segmentId if provided
    let segmentId = null;
    if (req.body.segmentId) {
      const segment = await prisma.segment.findUnique({
        where: { id: req.body.segmentId }
      });
      if (segment) {
        segmentId = req.body.segmentId;
      }
    }
    
    const campaign = await prisma.campaign.create({
      data: {
        name: req.body.name,
        userId: userId,
        status: req.body.status || "DRAFT",
        rulesJson: req.body.rules_json || '{}',
        segmentId: segmentId,
        messageTemplate: req.body.messageTemplate,
        scheduledAt: req.body.scheduledAt ? new Date(req.body.scheduledAt) : null,
      },
    });

    // If campaign is not DRAFT, send messages to customers
    if (campaign.status !== 'DRAFT' && campaign.messageTemplate) {
      let customerIds = [];
      
      if (segmentId) {
        // Get customers from segment
        const segment = await prisma.segment.findUnique({
          where: { id: segmentId }
        });
        
        if (segment) {
          const rules = JSON.parse(segment.rulesJson);
          const result = await SqlEvaluator.getAudience(prisma, rules);
          customerIds = result.customers.map((c: any) => c.id);
        }
      } else {
        // Get all customers if no segment
        const allCustomers = await prisma.customer.findMany({
          select: { id: true }
        });
        customerIds = allCustomers.map(c => c.id);
      }
      
      // Simulate sending messages
      if (customerIds.length > 0) {
        await simulateMessageSending(campaign.id, customerIds, campaign.messageTemplate);
      }
    }

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

export async function getAllCampaigns(req: Request, res: Response): Promise<void> {
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

    // Calculate message statistics for each campaign
    const campaignsWithStats = campaigns.map(campaign => {
      const totalMessages = campaign.communicationLogs.length;
      const sentMessages = campaign.communicationLogs.filter(log => log.status === 'SENT').length;
      const failedMessages = campaign.communicationLogs.filter(log => log.status === 'FAILED').length;
      const pendingMessages = campaign.communicationLogs.filter(log => log.status === 'PENDING').length;
      
      const successRate = totalMessages > 0 ? ((sentMessages / totalMessages) * 100).toFixed(1) : '0.0';
      const failureRate = totalMessages > 0 ? ((failedMessages / totalMessages) * 100).toFixed(1) : '0.0';

      return {
        ...campaign,
        messageStats: {
          total: totalMessages,
          sent: sentMessages,
          failed: failedMessages,
          pending: pendingMessages,
          successRate: `${successRate}%`,
          failureRate: `${failureRate}%`
        }
      };
    });

    res.json({
      success: true,
      data: campaignsWithStats,
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Handle specific Prisma errors
    if (error.code === 'P2021') {
      res.status(500).json({
        success: false,
        error: 'Database table not found',
        message: 'The campaigns table does not exist. Please run database migrations.',
        details: error.message
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export async function sendMessages(req: Request, res: Response): Promise<void> {
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
        error: 'Campaign not found'
      });
      return;
    }
    
    if (!campaign.messageTemplate) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no message template'
      });
      return;
    }
    
    let customerIds = [];
    
    if (campaign.segmentId) {
      // Get customers from segment
      const segment = await prisma.segment.findUnique({
        where: { id: campaign.segmentId }
      });
      
      if (segment) {
        const rules = JSON.parse(segment.rulesJson);
        const result = await SqlEvaluator.getAudience(prisma, rules);
        customerIds = result.customers.map((c: any) => c.id);
      }
    } else {
      // Get all customers if no segment
      const allCustomers = await prisma.customer.findMany({
        select: { id: true }
      });
      customerIds = allCustomers.map(c => c.id);
    }
    
    // Simulate sending messages
    if (customerIds.length > 0) {
      await simulateMessageSending(campaign.id, customerIds, campaign.messageTemplate);
      
      res.json({
        success: true,
        message: `Messages sent to ${customerIds.length} customers`,
        data: {
          campaignId: campaign.id,
          messagesSent: customerIds.length
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'No customers found to send messages to'
      });
    }
  } catch (error: any) {
    console.error('Error sending messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send messages'
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
      return;
    }

    if (!campaign.segment) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no associated segment',
      });
      return;
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
      return;
    }

    if (!campaign.segment) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no associated segment',
      });
      return;
    }

    if (!campaign.messageTemplate) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no message template',
      });
      return;
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

    // Try createMany first, if it fails due to messageId column, create individually
    try {
      await prisma.communicationLog.createMany({
        data: communicationLogs.map(log => ({
          ...log,
          messageId: generateMessageId()
        })),
      });
    } catch (error: any) {
      if (error.code === 'P2022' && error.meta?.column === 'messageId') {
        console.log('⚠️  messageId column not found, creating logs individually without it');
        // Create logs individually without messageId
        for (const log of communicationLogs) {
          await prisma.communicationLog.create({
            data: log
          });
        }
      } else {
        throw error;
      }
    }

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
      return;
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
      return;
    }

    if (!campaign.rulesJson) {
      res.status(400).json({
        success: false,
        error: 'Campaign has no rules defined',
      });
      return;
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

      // await campaignQueue.add("deliverMessage", {
      //   campaignId: campaign.id,
      //   customerId: customer.id,
      //   messageId: log.messageId,
      // });

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

