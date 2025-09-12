import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateDeliveryReceipt(req: Request, res: Response): Promise<void> {
  try {
    const { message_id, status } = req.body;

    if (!message_id || !status) {
      res.status(400).json({
        success: false,
        error: 'message_id and status are required',
      });
    }

    // Check if the communication log exists and is not already in a final status
    const existingLog = await prisma.communicationLog.findFirst({
      where: {
        messageId: message_id,
        status: {
          notIn: ['SENT', 'FAILED'] // Only update if not already final
        }
      }
    });

    if (!existingLog) {
      res.status(404).json({
        success: false,
        error: 'Message not found or already in final status',
      });
    }

    // Update the communication log with delivery receipt
    const updatedLog = await prisma.communicationLog.updateMany({
      where: {
        messageId: message_id,
        status: {
          notIn: ['SENT', 'FAILED'] // Ensure idempotency - only update if not final
        }
      },
      data: {
        status: status,
        lastAttemptAt: new Date(),
        deliveryReceipt: JSON.stringify({
          status: status,
          receivedAt: new Date().toISOString(),
          source: 'vendor_callback'
        }),
      },
    });

    if (updatedLog.count === 0) {
      res.status(409).json({
        success: false,
        error: 'Message already processed or not found',
      });
    }

    res.json({
      success: true,
      message: 'Delivery receipt updated successfully',
      data: {
        messageId: message_id,
        status: status,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating delivery receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update delivery receipt',
    });
  }
}
