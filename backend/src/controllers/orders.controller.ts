import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orderSchema } from '../validation/schemas';

const prisma = new PrismaClient();

// Generate unique order ID
function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

// Create a new order
export async function createOrder(req: Request, res: Response) {
  try {
    // Validate request body
    const validatedData = orderSchema.parse(req.body);
    
    // Check if customer exists
    const customerId = validatedData.customerId;
    
    const customer = await prisma.customer.findUnique({
      where: { 
        id: customerId
      }
    });
    
    if (!customer) {
      return res.status(400).json({ 
        error: 'Customer not found. Please provide a valid customer ID or email.' 
      });
    }
    
    // Generate unique order ID
    const orderId = generateOrderId();
    
    // Create the order
    const order = await prisma.order.create({
      data: {
        orderId: orderId,
        customerId: customer.id,
        amount: validatedData.amount,
        status: validatedData.status || 'PENDING'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Update customer's total spend
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpend: {
          increment: validatedData.amount
        }
      }
    });
    
    return res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customer.name,
        amount: order.amount,
        status: order.status,
        date: order.createdAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message
    });
  }
}

// Get all orders with pagination and filtering
export async function getOrders(req: Request, res: Response) {
  try {
    console.log('Fetching orders with query:', req.query);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    const where: any = {};
    
    if (req.query.customerId) {
      where.customerId = req.query.customerId;
    }
    
    if (req.query.fromDate || req.query.toDate) {
      where.createdAt = {};
      if (req.query.fromDate) {
        where.createdAt.gte = new Date(req.query.fromDate as string);
      }
      if (req.query.toDate) {
        where.createdAt.lte = new Date(req.query.toDate as string);
      }
    }
    
    // Get orders with pagination
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);
    
    // Transform orders for frontend
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderId: order.orderId,
      customerId: order.customerId,
      customerName: order.customer.name,
      amount: order.amount,
      status: order.status,
      date: order.createdAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    const totalPages = Math.ceil(total / limit);
    
    console.log(`Found ${total} orders, returning ${transformedOrders.length} orders`);
    
    return res.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
}

// Get a single order by ID
export async function getOrderById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const transformedOrder = {
      id: order.id,
      orderId: order.orderId,
      customerId: order.customerId,
      customerName: order.customer.name,
      customerEmail: order.customer.email,
      customerPhone: order.customer.phone,
      amount: order.amount,
      status: order.status,
      date: order.createdAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    return res.json({ order: transformedOrder });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      error: 'Failed to fetch order',
      message: error.message
    });
  }
}

// Update an order
export async function updateOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If amount is being updated, adjust customer's total spend
    if (updateData.amount && updateData.amount !== existingOrder.amount) {
      const amountDifference = updateData.amount - existingOrder.amount;
      await prisma.customer.update({
        where: { id: existingOrder.customerId },
        data: {
          totalSpend: {
            increment: amountDifference
          }
        }
      });
    }
    
    // Update the order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...(updateData.amount && { amount: updateData.amount }),
        ...(updateData.status && { status: updateData.status })
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    const transformedOrder = {
      id: updatedOrder.id,
      orderId: updatedOrder.orderId,
      customerId: updatedOrder.customerId,
      customerName: updatedOrder.customer.name,
      amount: updatedOrder.amount,
      status: updatedOrder.status,
      date: updatedOrder.createdAt,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt
    };
    
    return res.json({
      message: 'Order updated successfully',
      order: transformedOrder
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return res.status(500).json({
      error: 'Failed to update order',
      message: error.message
    });
  }
}

// Delete an order
export async function deleteOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    
    // Check if order exists and get amount for customer spend adjustment
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { customer: true }
    });
    
    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Delete the order
    await prisma.order.delete({
      where: { id }
    });
    
    // Adjust customer's total spend
    await prisma.customer.update({
      where: { id: existingOrder.customerId },
      data: {
        totalSpend: {
          decrement: existingOrder.amount
        }
      }
    });
    
    console.log('Order deleted successfully:', id);
    
    return res.json({ message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return res.status(500).json({
      error: 'Failed to delete order',
      message: error.message
    });
  }
}
