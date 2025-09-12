// Test script to demonstrate the SQL evaluator
const { SqlEvaluator } = require('./dist/services/sqlEvaluator.service.js');

// Example rules from the user's request
const exampleRules = {
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
};

console.log('🧪 Testing SQL Evaluator');
console.log('========================');

console.log('\n📋 Example Rules:');
console.log(JSON.stringify(exampleRules, null, 2));

console.log('\n🔍 Rule Explanation:');
console.log('Select customers who either:');
console.log('1. Spent more than $10,000 AND visited less than 3 times');
console.log('2. OR have last_active date before Jan 1, 2025');

console.log('\n⚙️ Converting to Prisma Where Clause:');
try {
  const prismaWhere = SqlEvaluator.rulesToPrismaWhere(exampleRules);
  console.log(JSON.stringify(prismaWhere, null, 2));
} catch (error) {
  console.error('Error converting to Prisma:', error.message);
}

console.log('\n📊 Generated SQL Query:');
try {
  const sqlQuery = SqlEvaluator.rulesToSqlString(exampleRules);
  console.log('SELECT * FROM customers WHERE', sqlQuery);
  console.log('\nSELECT COUNT(*) FROM customers WHERE', sqlQuery);
} catch (error) {
  console.error('Error generating SQL:', error.message);
}

console.log('\n✅ Rules Validation:');
const validation = SqlEvaluator.validateRulesForSql(exampleRules);
console.log(`Rules are valid: ${validation.isValid ? 'YES' : 'NO'}`);
if (!validation.isValid) {
  console.log(`Error: ${validation.error}`);
}

console.log('\n🎯 Test with Different Rule Types:');

// Test numeric comparison
const numericRule = { "field": "total_spend", "operator": ">", "value": 5000 };
console.log('\nNumeric Rule:', JSON.stringify(numericRule, null, 2));
console.log('Prisma Where:', JSON.stringify(SqlEvaluator.rulesToPrismaWhere(numericRule), null, 2));
console.log('SQL:', SqlEvaluator.rulesToSqlString(numericRule));

// Test string comparison
const stringRule = { "field": "email", "operator": "contains", "value": "@company.com" };
console.log('\nString Rule:', JSON.stringify(stringRule, null, 2));
console.log('Prisma Where:', JSON.stringify(SqlEvaluator.rulesToPrismaWhere(stringRule), null, 2));
console.log('SQL:', SqlEvaluator.rulesToSqlString(stringRule));

// Test date comparison
const dateRule = { "field": "last_active", "operator": ">", "value": "2024-01-01" };
console.log('\nDate Rule:', JSON.stringify(dateRule, null, 2));
console.log('Prisma Where:', JSON.stringify(SqlEvaluator.rulesToPrismaWhere(dateRule), null, 2));
console.log('SQL:', SqlEvaluator.rulesToSqlString(dateRule));

// Test complex nested rules
const complexRules = {
  "op": "AND",
  "rules": [
    { "field": "total_spend", "operator": ">=", "value": 1000 },
    {
      "op": "OR",
      "rules": [
        { "field": "visits_count", "operator": ">", "value": 5 },
        { "field": "email", "operator": "ends_with", "value": ".com" }
      ]
    }
  ]
};

console.log('\nComplex Nested Rules:', JSON.stringify(complexRules, null, 2));
console.log('Prisma Where:', JSON.stringify(SqlEvaluator.rulesToPrismaWhere(complexRules), null, 2));
console.log('SQL:', SqlEvaluator.rulesToSqlString(complexRules));

console.log('\n🎉 SQL Evaluator Test Complete!');
console.log('\n💡 Key Benefits:');
console.log('- Converts JSON rules to efficient database queries');
console.log('- Supports all rule types: numeric, string, date, array');
console.log('- Handles complex nested AND/OR logic');
console.log('- Generates both Prisma and raw SQL queries');
console.log('- Validates rules before execution');
console.log('- Optimized for performance with database-level filtering');

