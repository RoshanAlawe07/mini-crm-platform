# Customer Segmentation Rules Format

This document explains the JSON-based rules format used for customer segmentation in the Mini CRM Platform.

## Overview

The rules format allows you to create complex customer segments using a flexible JSON structure that supports logical operators (AND/OR) and various comparison operators.

## Basic Structure

### Single Rule
```json
{
  "field": "total_spend",
  "operator": ">",
  "value": 10000
}
```

### Rules Group
```json
{
  "op": "AND",
  "rules": [
    { "field": "total_spend", "operator": ">", "value": 10000 },
    { "field": "visits_count", "operator": "<", "value": 3 }
  ]
}
```

### Complex Nested Rules
```json
{
  "op": "OR",
  "rules": [
    {
      "op": "AND",
      "rules": [
        { "field": "total_spend", "operator": ">", "value": 10000 },
        { "field": "visits_count", "operator": "<", "value": 3 }
      ]
    },
    { "field": "last_active", "operator": "<", "value": "2025-01-01" }
  ]
}
```

## Available Fields

| Field | Type | Description |
|-------|------|-------------|
| `total_spend` | Number | Customer's total spending amount |
| `visits_count` | Number | Number of customer visits |
| `last_active` | Date | Last active date (ISO string or Date object) |
| `name` | String | Customer's name |
| `email` | String | Customer's email address |
| `phone` | String | Customer's phone number |
| `created_at` | Date | Customer creation date |

## Available Operators

### Numeric Operators
- `=` - Equal to
- `!=` - Not equal to
- `>` - Greater than
- `>=` - Greater than or equal to
- `<` - Less than
- `<=` - Less than or equal to

### String Operators
- `contains` - Contains substring (case-insensitive)
- `not_contains` - Does not contain substring (case-insensitive)
- `starts_with` - Starts with substring (case-insensitive)
- `ends_with` - Ends with substring (case-insensitive)

### Array Operators
- `in` - Value is in array
- `not_in` - Value is not in array

## Logical Operators

- `AND` - All rules must be true
- `OR` - At least one rule must be true

## Examples

### Example 1: High-Value, Low-Frequency Customers
```json
{
  "op": "AND",
  "rules": [
    { "field": "total_spend", "operator": ">", "value": 10000 },
    { "field": "visits_count", "operator": "<", "value": 3 }
  ]
}
```
**Selects:** Customers who spent more than $10,000 AND visited less than 3 times.

### Example 2: Inactive Customers
```json
{
  "op": "OR",
  "rules": [
    { "field": "last_active", "operator": "<", "value": "2024-01-01" },
    { "field": "visits_count", "operator": "=", "value": 0 }
  ]
}
```
**Selects:** Customers who either haven't been active since 2024 OR have never visited.

### Example 3: Email Domain Segmentation
```json
{
  "op": "AND",
  "rules": [
    { "field": "email", "operator": "contains", "value": "@company.com" },
    { "field": "total_spend", "operator": ">", "value": 5000 }
  ]
}
```
**Selects:** Customers with company email addresses who spent more than $5,000.

### Example 4: Complex Multi-Criteria Segmentation
```json
{
  "op": "OR",
  "rules": [
    {
      "op": "AND",
      "rules": [
        { "field": "total_spend", "operator": ">", "value": 15000 },
        { "field": "visits_count", "operator": ">=", "value": 5 }
      ]
    },
    {
      "op": "AND",
      "rules": [
        { "field": "last_active", "operator": ">", "value": "2024-06-01" },
        { "field": "name", "operator": "starts_with", "value": "VIP" }
      ]
    }
  ]
}
```
**Selects:** Customers who either:
- Spent more than $15,000 AND visited 5+ times, OR
- Were active after June 2024 AND have names starting with "VIP"

## API Usage

### Creating a Segment
```javascript
POST /api/segments
{
  "name": "High Value Customers",
  "rulesJson": "{\"op\":\"AND\",\"rules\":[{\"field\":\"total_spend\",\"operator\":\">\",\"value\":10000}]}",
  "createdBy": "admin"
}
```

### Getting Segment Customers
```javascript
GET /api/segments/{segmentId}/customers?page=1&limit=10
```

### Validating Rules
```javascript
POST /api/segments/validate-rules
{
  "rules": {
    "op": "AND",
    "rules": [
      { "field": "total_spend", "operator": ">", "value": 10000 }
    ]
  }
}
```

### Filtering Customers by Rules
```javascript
POST /api/customers/filter-by-rules
{
  "rules": {
    "op": "OR",
    "rules": [
      { "field": "total_spend", "operator": ">", "value": 10000 },
      { "field": "visits_count", "operator": "<", "value": 3 }
    ]
  },
  "page": 1,
  "limit": 10
}
```

## Frontend Usage

The frontend provides a user-friendly interface for creating and managing segments:

1. **Navigate to Segments**: Go to `/segments` in the frontend
2. **Create Segment**: Click "Create New Segment" and fill in the form
3. **Edit Rules**: Use the JSON editor to define your rules
4. **Preview Customers**: View which customers match your segment criteria
5. **Manage Segments**: Edit, delete, or duplicate existing segments

## Testing

You can test the rules engine using the provided test script:

```bash
cd backend
node test-rules.js
```

This will run through example rules and show which customers match the criteria.

## Best Practices

1. **Start Simple**: Begin with basic rules and gradually add complexity
2. **Test Thoroughly**: Use the validation endpoint to ensure your rules are valid
3. **Use Meaningful Names**: Give your segments descriptive names
4. **Document Rules**: Add comments in your segment descriptions explaining the logic
5. **Monitor Performance**: For large datasets, consider indexing frequently used fields
6. **Regular Review**: Periodically review and update segment rules as business needs change

## Error Handling

The system provides comprehensive error handling:

- **Invalid JSON**: Returns validation error with specific details
- **Invalid Fields**: Lists available fields in error message
- **Invalid Operators**: Shows supported operators for each field type
- **Type Mismatches**: Handles automatic type conversion where possible

## Performance Considerations

- Rules are evaluated in-memory for maximum flexibility
- For very large datasets (>10,000 customers), consider implementing database-level filtering
- Complex nested rules may impact performance; test with your data size
- Consider caching segment results for frequently accessed segments

