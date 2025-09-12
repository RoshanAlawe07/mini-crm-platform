// Test script to demonstrate the rules format
const { RulesEngine } = require('./dist/services/rulesEngine.service.js');

// Sample customer data
const customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    totalSpend: 15000,
    lastActive: new Date('2024-12-01'),
    visitsCount: 2,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    totalSpend: 5000,
    lastActive: new Date('2024-11-15'),
    visitsCount: 5,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phone: '+1234567892',
    totalSpend: 12000,
    lastActive: new Date('2024-06-01'),
    visitsCount: 1,
    createdAt: new Date('2024-03-01')
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    phone: '+1234567893',
    totalSpend: 8000,
    lastActive: new Date('2023-12-01'),
    visitsCount: 3,
    createdAt: new Date('2024-04-01')
  }
];

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

console.log('🧪 Testing Rules Engine with Example Rules');
console.log('==========================================');

console.log('\n📋 Sample Customers:');
customers.forEach(customer => {
  console.log(`- ${customer.name}: $${customer.totalSpend} spent, ${customer.visitsCount} visits, last active: ${customer.lastActive.toISOString().split('T')[0]}`);
});

console.log('\n🎯 Rules to Apply:');
console.log(JSON.stringify(exampleRules, null, 2));

console.log('\n🔍 Rule Explanation:');
console.log('Select customers who either:');
console.log('1. Spent more than $10,000 AND visited less than 3 times');
console.log('2. OR have last_active date before Jan 1, 2025');

console.log('\n✅ Matching Customers:');
const matchingCustomers = RulesEngine.filterCustomers(customers, exampleRules);

if (matchingCustomers.length === 0) {
  console.log('No customers match the criteria.');
} else {
  matchingCustomers.forEach(customer => {
    console.log(`✓ ${customer.name} - $${customer.totalSpend} spent, ${customer.visitsCount} visits, last active: ${customer.lastActive.toISOString().split('T')[0]}`);
  });
}

console.log(`\n📊 Total matches: ${matchingCustomers.length} out of ${customers.length} customers`);

// Test individual rule evaluation
console.log('\n🔬 Individual Rule Testing:');
console.log('Testing John Doe against the rules...');
const johnMatches = RulesEngine.evaluateCustomer(customers[0], exampleRules);
console.log(`John Doe matches: ${johnMatches ? 'YES' : 'NO'}`);

console.log('\nTesting Jane Smith against the rules...');
const janeMatches = RulesEngine.evaluateCustomer(customers[1], exampleRules);
console.log(`Jane Smith matches: ${janeMatches ? 'YES' : 'NO'}`);

// Test rules validation
console.log('\n✅ Rules Validation:');
const validation = RulesEngine.validateRules(exampleRules);
console.log(`Rules are valid: ${validation.isValid ? 'YES' : 'NO'}`);
if (!validation.isValid) {
  console.log(`Error: ${validation.error}`);
}

console.log('\n🎉 Rules Engine Test Complete!');

