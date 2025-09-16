import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

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
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from authentication endpoints'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'string',
              description: 'Customer ID',
              example: 'clx1234567890'
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
              example: '+1-555-123-4567'
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
              description: 'Last active date',
              example: '2024-01-15T10:30:00Z'
            },
            visitsCount: {
              type: 'integer',
              description: 'Number of visits',
              example: 15
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date',
              example: '2024-01-01T00:00:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer last update date',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Order: {
          type: 'object',
          required: ['customerId', 'amount'],
          properties: {
            id: {
              type: 'string',
              description: 'Order ID',
              example: 'ord_1234567890'
            },
            customerId: {
              type: 'string',
              description: 'Customer ID',
              example: 'clx1234567890'
            },
            amount: {
              type: 'number',
              format: 'float',
              description: 'Order amount',
              example: 99.99
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
              description: 'Order status',
              example: 'COMPLETED'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order last update date',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Campaign: {
          type: 'object',
          required: ['name', 'messageTemplate'],
          properties: {
            id: {
              type: 'string',
              description: 'Campaign ID',
              example: 'camp_1234567890'
            },
            name: {
              type: 'string',
              description: 'Campaign name',
              example: 'Summer Sale 2024'
            },
            description: {
              type: 'string',
              description: 'Campaign description',
              example: 'Promotional campaign for summer products'
            },
            messageTemplate: {
              type: 'string',
              description: 'Campaign message template',
              example: 'Hi {{name}}, check out our summer sale with up to 50% off!'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SCHEDULED', 'SENT', 'FAILED'],
              description: 'Campaign status',
              example: 'DRAFT'
            },
            segmentId: {
              type: 'string',
              description: 'Target segment ID',
              example: 'seg_1234567890'
            },
            rules: {
              type: 'object',
              description: 'Campaign targeting rules'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Campaign creation date',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Campaign last update date',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        Segment: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'Segment ID',
              example: 'seg_1234567890'
            },
            name: {
              type: 'string',
              description: 'Segment name',
              example: 'High Value Customers'
            },
            description: {
              type: 'string',
              description: 'Segment description',
              example: 'Customers who have spent more than $1000'
            },
            rules: {
              type: 'object',
              description: 'Segment filtering rules',
              example: {
                conditions: [
                  {
                    field: 'totalSpend',
                    operator: 'gt',
                    value: 1000
                  }
                ]
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Segment creation date',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Segment last update date',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
              example: 'usr_1234567890'
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
            role: {
              type: 'string',
              description: 'User role',
              example: 'admin'
            },
            googleId: {
              type: 'string',
              description: 'Google OAuth ID',
              example: 'google_1234567890'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
              example: '2024-01-15T10:30:00Z'
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
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User'
                },
                token: {
                  type: 'string',
                  description: 'JWT authentication token',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
              }
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Items per page',
              example: 10
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page',
              example: true
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page',
              example: false
            }
          }
        },
        VendorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['SENT', 'FAILED'],
              description: 'Message delivery status',
              example: 'SENT'
            },
            message_id: {
              type: 'string',
              description: 'Message ID',
              example: 'msg_1234567890'
            },
            vendor_response: {
              type: 'string',
              description: 'Vendor response message',
              example: 'Message delivered successfully'
            },
            processing_time_ms: {
              type: 'integer',
              description: 'Processing time in milliseconds',
              example: 1250
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation failed'
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
              example: 'Required field "email" is missing'
            },
            details: {
              type: 'object',
              description: 'Additional error details'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status',
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
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints'
      },
      {
        name: 'Customers',
        description: 'Customer management operations'
      },
      {
        name: 'Orders',
        description: 'Order management operations'
      },
      {
        name: 'Campaigns',
        description: 'Marketing campaign management'
      },
      {
        name: 'Segments',
        description: 'Customer segmentation operations'
      },
      {
        name: 'Vendor',
        description: 'External vendor API simulation'
      },
      {
        name: 'System',
        description: 'System health and status endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/index.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'XenoCRM API Documentation'
  }));
  
  // Serve swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
