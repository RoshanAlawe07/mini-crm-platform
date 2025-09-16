# Swagger UI Setup for XenoCRM API

## Overview
This document describes the Swagger UI setup for the XenoCRM API, providing comprehensive API documentation and interactive testing capabilities.

## Features
- **Interactive API Documentation**: Complete documentation for all API endpoints
- **Request/Response Examples**: Detailed examples for all API calls
- **Schema Definitions**: Comprehensive data models for all entities
- **Try It Out**: Interactive testing directly from the documentation
- **Authentication Support**: JWT Bearer token authentication

## Access Points

### Swagger UI
- **Local Development**: `http://localhost:3002/api-docs`
- **Production**: `https://your-backend-url.com/api-docs`

### Swagger JSON
- **Local Development**: `http://localhost:3002/api-docs.json`
- **Production**: `https://your-backend-url.com/api-docs.json`

## API Endpoints Documented

### 1. System Endpoints
- `GET /health` - Health check
- `GET /status` - Comprehensive status information

### 2. Customer Management
- `POST /api/customers` - Create customer
- `GET /api/customers` - Get all customers (with pagination and filtering)
- `POST /api/customers/filter-by-rules` - Filter customers by custom rules

### 3. Order Management
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

### 4. Campaign Management
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/{id}` - Get campaign by ID
- `PUT /api/campaigns/{id}` - Update campaign
- `DELETE /api/campaigns/{id}` - Delete campaign
- `POST /api/campaigns/{id}/launch` - Launch campaign
- `POST /api/campaigns/{id}/send-messages` - Send campaign messages

### 5. Segment Management
- `POST /api/segments` - Create segment
- `GET /api/segments` - Get all segments
- `GET /api/segments/{id}` - Get segment by ID
- `PUT /api/segments/{id}` - Update segment
- `DELETE /api/segments/{id}` - Delete segment
- `GET /api/segments/{id}/customers` - Get customers in segment

## Data Models

### Customer
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "totalSpend": "number",
  "lastActive": "date-time",
  "visitsCount": "number",
  "createdAt": "date-time"
}
```

### Order
```json
{
  "id": "string",
  "customerId": "string",
  "amount": "number",
  "status": "PENDING|COMPLETED|CANCELLED",
  "createdAt": "date-time"
}
```

### Campaign
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "messageTemplate": "string",
  "status": "DRAFT|SCHEDULED|SENT|FAILED",
  "segmentId": "string",
  "createdAt": "date-time"
}
```

### Segment
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "rules": "object",
  "createdAt": "date-time"
}
```

## Authentication

The API supports JWT Bearer token authentication. To use authenticated endpoints:

1. Obtain a JWT token from the authentication endpoint
2. Click the "Authorize" button in Swagger UI
3. Enter your token in the format: `Bearer your-jwt-token-here`
4. Click "Authorize"

## Usage Examples

### Creating a Customer
```bash
curl -X POST "http://localhost:3002/api/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "total_spend": 1000,
    "visits_count": 5
  }'
```

### Getting Customers with Pagination
```bash
curl -X GET "http://localhost:3002/api/customers?page=1&limit=10&search=john"
```

### Creating a Campaign
```bash
curl -X POST "http://localhost:3002/api/campaigns" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Summer Sale Campaign",
    "messageTemplate": "Get 20% off on all summer items!",
    "segmentId": "segment-id-here",
    "status": "DRAFT"
  }'
```

## Development

### Adding New Endpoints
To add Swagger documentation for new endpoints:

1. Add JSDoc comments above your route definitions
2. Use the `@swagger` tag
3. Follow the OpenAPI 3.0 specification
4. Reference existing schemas using `$ref: '#/components/schemas/SchemaName'`

### Example Documentation
```javascript
/**
 * @swagger
 * /api/example:
 *   post:
 *     summary: Example endpoint
 *     tags: [Examples]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
```

## Troubleshooting

### Common Issues
1. **Swagger UI not loading**: Check if the server is running on the correct port
2. **Missing endpoints**: Ensure JSDoc comments are properly formatted
3. **Schema errors**: Verify schema references are correct

### Debugging
- Check server logs for any compilation errors
- Verify that all route files are being scanned by swagger-jsdoc
- Test individual endpoints using curl or Postman

## Production Deployment

When deploying to production:

1. Update the server URLs in `swagger.ts`
2. Ensure CORS is properly configured
3. Set up proper authentication
4. Consider rate limiting for the documentation endpoints

## Support

For issues or questions about the API documentation:
- Check the server logs
- Verify endpoint availability
- Test with the interactive Swagger UI
