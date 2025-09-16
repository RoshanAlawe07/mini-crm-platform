import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XenoCRM API',
      version: '1.0.0',
      description: 'Mini CRM Platform API Documentation - A comprehensive customer relationship management system with customer management, order tracking, segmentation, and marketing campaigns.',
      contact: {
        name: 'XenoCRM Team',
        email: 'support@xenocrm.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'https://mini-crm-platform-tnsk.onrender.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'isAuthenticated',
          description: 'Simple cookie-based authentication'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique customer identifier',
              example: 'cm123456789'
            },
            name: {
              type: 'string',
              description: 'Customer full name',
              example: 'John Doe'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'john.doe@example.com'
            },
            phone: {
              type: 'string',
              description: 'Customer phone number',
              example: '+1234567890'
            },
            totalSpend: {
              type: 'number',
              format: 'float',
              description: 'Total amount spent by customer',
              example: 1250.50
            },
            lastActive: {
              type: 'string',
              format: 'date-time',
              description: 'Last activity date',
              example: '2024-01-15T10:30:00Z'
            },
            visitsCount: {
              type: 'integer',
              description: 'Number of visits',
              example: 25
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date',
              example: '2024-01-01T00:00:00Z'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['customerId', 'amount'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique order identifier',
              example: 'ord123456789'
            },
            customerId: {
              type: 'string',
              description: 'Customer ID who placed the order',
              example: 'cm123456789'
            },
            orderId: {
              type: 'string',
              description: 'External order ID',
              example: 'EXT-ORD-001'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Order amount',
              example: 299.99
            },
            orderDate: {
              type: 'string',
              format: 'date-time',
              description: 'Order date',
              example: '2024-01-15T14:30:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
              example: '2024-01-15T14:30:00Z'
            }
          }
        },
        Campaign: {
          type: 'object',
          required: ['userId', 'name'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique campaign identifier',
              example: 'cmp123456789'
            },
            userId: {
              type: 'string',
              description: 'User ID who created the campaign',
              example: 'usr123456789'
            },
            segmentId: {
              type: 'string',
              description: 'Segment ID for targeted campaign',
              example: 'seg123456789'
            },
            name: {
              type: 'string',
              description: 'Campaign name',
              example: 'Summer Sale 2024'
            },
            messageTemplate: {
              type: 'string',
              description: 'Campaign message template',
              example: 'Hi {{name}}, check out our summer sale!'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SCHEDULED', 'SENT'],
              description: 'Campaign status',
              example: 'DRAFT'
            },
            rulesJson: {
              type: 'string',
              description: 'JSON string containing campaign rules',
              example: '{"minSpend": 100, "category": "electronics"}'
            },
            scheduledAt: {
              type: 'string',
              format: 'date-time',
              description: 'Scheduled send date',
              example: '2024-06-01T09:00:00Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Campaign creation date',
              example: '2024-01-15T10:00:00Z'
            }
          }
        },
        Segment: {
          type: 'object',
          required: ['userId', 'name', 'rulesJson'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique segment identifier',
              example: 'seg123456789'
            },
            userId: {
              type: 'string',
              description: 'User ID who created the segment',
              example: 'usr123456789'
            },
            name: {
              type: 'string',
              description: 'Segment name',
              example: 'High Value Customers'
            },
            rulesJson: {
              type: 'string',
              description: 'JSON string containing segmentation rules',
              example: '{"totalSpend": {"$gte": 1000}, "visitsCount": {"$gte": 5}}'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Segment creation date',
              example: '2024-01-15T10:00:00Z'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique user identifier',
              example: 'usr123456789'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com'
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe'
            },
            picture: {
              type: 'string',
              format: 'uri',
              description: 'User profile picture URL',
              example: 'https://example.com/avatar.jpg'
            },
            googleId: {
              type: 'string',
              description: 'Google OAuth ID',
              example: '106488310667415386758'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Authentication success status',
              example: true
            },
            user: {
              $ref: '#/components/schemas/User'
            },
            error: {
              type: 'string',
              description: 'Error message if authentication failed',
              example: 'Invalid credentials'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                total: {
                  type: 'integer',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  example: 10
                }
              }
            }
          }
        },
        VendorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            messageId: {
              type: 'string',
              description: 'Unique message identifier',
              example: 'msg123456789'
            },
            status: {
              type: 'string',
              enum: ['SENT', 'FAILED', 'PENDING'],
              example: 'SENT'
            },
            deliveryReceipt: {
              type: 'object',
              description: 'Delivery confirmation details'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Something went wrong'
            },
            details: {
              type: 'string',
              description: 'Detailed error information',
              example: 'Database connection failed'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization endpoints' },
      { name: 'Customers', description: 'Customer management operations' },
      { name: 'Orders', description: 'Order management operations' },
      { name: 'Campaigns', description: 'Marketing campaign management' },
      { name: 'Segments', description: 'Customer segmentation operations' },
      { name: 'Vendor', description: 'External vendor API simulation' },
      { name: 'System', description: 'System health and status endpoints' }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/index.ts']
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };