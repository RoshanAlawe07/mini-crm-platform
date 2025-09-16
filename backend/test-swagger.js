const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'XenoCRM API',
      version: '1.0.0',
      description: 'Mini CRM Platform API Documentation',
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server'
      }
    ],
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'XenoCRM API Documentation'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Swagger test server is running' });
});

const PORT = 3003;
app.listen(PORT, () => {
  console.log(`🚀 Swagger test server running on port ${PORT}`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
});
