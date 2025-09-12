import { Customer } from '@prisma/client';

export interface Rule {
  field: string;
  operator: string;
  value: any;
}

export interface RulesGroup {
  op: 'AND' | 'OR';
  rules: (Rule | RulesGroup)[];
}

export class RulesEngine {
  /**
   * Evaluates if a customer matches the given rules
   */
  static evaluateCustomer(customer: Customer, rules: RulesGroup | Rule): boolean {
    if ('field' in rules) {
      // This is a single rule
      return this.evaluateSingleRule(customer, rules);
    } else {
      // This is a rules group
      return this.evaluateRulesGroup(customer, rules);
    }
  }

  /**
   * Evaluates a single rule against a customer
   */
  private static evaluateSingleRule(customer: Customer, rule: Rule): boolean {
    const fieldValue = this.getFieldValue(customer, rule.field);
    const ruleValue = rule.value;

    switch (rule.operator) {
      case '=':
        return fieldValue === ruleValue;
      case '!=':
        return fieldValue !== ruleValue;
      case '>':
        return this.compareValues(fieldValue, ruleValue) > 0;
      case '>=':
        return this.compareValues(fieldValue, ruleValue) >= 0;
      case '<':
        return this.compareValues(fieldValue, ruleValue) < 0;
      case '<=':
        return this.compareValues(fieldValue, ruleValue) <= 0;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'not_contains':
        return !String(fieldValue).toLowerCase().includes(String(ruleValue).toLowerCase());
      case 'starts_with':
        return String(fieldValue).toLowerCase().startsWith(String(ruleValue).toLowerCase());
      case 'ends_with':
        return String(fieldValue).toLowerCase().endsWith(String(ruleValue).toLowerCase());
      case 'in':
        return Array.isArray(ruleValue) && ruleValue.includes(fieldValue);
      case 'not_in':
        return Array.isArray(ruleValue) && !ruleValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * Evaluates a rules group (AND/OR logic)
   */
  private static evaluateRulesGroup(customer: Customer, rulesGroup: RulesGroup): boolean {
    if (rulesGroup.op === 'AND') {
      return rulesGroup.rules.every(rule => this.evaluateCustomer(customer, rule));
    } else if (rulesGroup.op === 'OR') {
      return rulesGroup.rules.some(rule => this.evaluateCustomer(customer, rule));
    }
    return false;
  }

  /**
   * Gets the field value from a customer object
   */
  private static getFieldValue(customer: Customer, field: string): any {
    switch (field) {
      case 'total_spend':
        return customer.totalSpend;
      case 'visits_count':
        return customer.visitsCount;
      case 'last_active':
        return customer.lastActive;
      case 'name':
        return customer.name;
      case 'email':
        return customer.email;
      case 'phone':
        return customer.phone;
      case 'created_at':
        return customer.createdAt;
      default:
        return null;
    }
  }

  /**
   * Compares two values for numeric operations
   */
  private static compareValues(a: any, b: any): number {
    // Handle date comparisons
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }
    
    // Handle date string comparisons
    if (typeof a === 'string' && typeof b === 'string' && this.isDateString(a) && this.isDateString(b)) {
      return new Date(a).getTime() - new Date(b).getTime();
    }
    
    // Handle numeric comparisons
    const numA = Number(a);
    const numB = Number(b);
    
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // Fallback to string comparison
    return String(a).localeCompare(String(b));
  }

  /**
   * Checks if a string is a valid date string
   */
  private static isDateString(str: string): boolean {
    return !isNaN(Date.parse(str));
  }

  /**
   * Filters customers based on rules
   */
  static filterCustomers(customers: Customer[], rules: RulesGroup | Rule): Customer[] {
    return customers.filter(customer => this.evaluateCustomer(customer, rules));
  }

  /**
   * Validates rules format
   */
  static validateRules(rules: any): { isValid: boolean; error?: string } {
    try {
      if (!rules || typeof rules !== 'object') {
        return { isValid: false, error: 'Rules must be an object' };
      }

      if ('field' in rules) {
        // Single rule validation
        if (!rules.field || !rules.operator || rules.value === undefined) {
          return { isValid: false, error: 'Single rule must have field, operator, and value' };
        }
        return { isValid: true };
      } else if ('op' in rules && 'rules' in rules) {
        // Rules group validation
        if (!['AND', 'OR'].includes(rules.op)) {
          return { isValid: false, error: 'Rules group op must be AND or OR' };
        }
        
        if (!Array.isArray(rules.rules) || rules.rules.length === 0) {
          return { isValid: false, error: 'Rules group must have non-empty rules array' };
        }

        // Recursively validate each rule
        for (const rule of rules.rules) {
          const validation = this.validateRules(rule);
          if (!validation.isValid) {
            return validation;
          }
        }
        
        return { isValid: true };
      } else {
        return { isValid: false, error: 'Invalid rules format' };
      }
    } catch (error) {
      return { isValid: false, error: 'Invalid rules format' };
    }
  }
}

