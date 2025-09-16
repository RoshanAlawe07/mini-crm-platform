import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XenoCRM API',
      version: '1.0.0',
      description: 'Mini CRM Platform API Documentation',
      contact: {
        name: 'XenoCRM Team',
        email: 'support@xenocrm.com'
      }
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:3002',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3002',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Customer ID'
            },
            name: {
              type: 'string',
              description: 'Customer name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address'
            },
            phone: {
              type: 'string',
              description: 'Customer phone number'
            },
            totalSpend: {
              type: 'number',
              description: 'Total amount spent by customer'
            },
            lastActive: {
              type: 'string',
              format: 'date-time',
              description: 'Last active date'
            },
            visitsCount: {
              type: 'number',
              description: 'Number of visits'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Order ID'
            },
            customerId: {
              type: 'string',
              description: 'Customer ID'
            },
            amount: {
              type: 'number',
              description: 'Order amount'
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
              description: 'Order status'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Order creation date'
            }
          }
        },
        Campaign: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Campaign ID'
            },
            name: {
              type: 'string',
              description: 'Campaign name'
            },
            description: {
              type: 'string',
              description: 'Campaign description'
            },
            messageTemplate: {
              type: 'string',
              description: 'Campaign message template'
            },
            status: {
              type: 'string',
              enum: ['DRAFT', 'SCHEDULED', 'SENT', 'FAILED'],
              description: 'Campaign status'
            },
            segmentId: {
              type: 'string',
              description: 'Target segment ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Campaign creation date'
            }
          }
        },
        Segment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Segment ID'
            },
            name: {
              type: 'string',
              description: 'Segment name'
            },
            description: {
              type: 'string',
              description: 'Segment description'
            },
            rules: {
              type: 'object',
              description: 'Segment rules'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Segment creation date'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error message'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Success status'
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
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
