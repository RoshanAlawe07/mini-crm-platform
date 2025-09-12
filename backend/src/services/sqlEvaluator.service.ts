import { Prisma } from '@prisma/client';

export interface Rule {
  field: string;
  operator: string;
  value: any;
}

export interface RulesGroup {
  op: 'AND' | 'OR';
  rules: (Rule | RulesGroup)[];
}

export class SqlEvaluator {
  /**
   * Converts JSON rules to Prisma where clause
   */
  static rulesToPrismaWhere(rules: RulesGroup | Rule): Prisma.CustomerWhereInput {
    if ('field' in rules) {
      // Single rule
      return this.singleRuleToPrisma(rules);
    } else {
      // Rules group
      return this.rulesGroupToPrisma(rules);
    }
  }

  /**
   * Converts a single rule to Prisma where clause
   */
  private static singleRuleToPrisma(rule: Rule): Prisma.CustomerWhereInput {
    const field = this.mapFieldName(rule.field);
    const value = this.convertValue(rule.value, rule.field);

    switch (rule.operator) {
      case '=':
        return { [field]: { equals: value } };
      case '!=':
        return { [field]: { not: { equals: value } } };
      case '>':
        return { [field]: { gt: value } };
      case '>=':
        return { [field]: { gte: value } };
      case '<':
        return { [field]: { lt: value } };
      case '<=':
        return { [field]: { lte: value } };
      case 'contains':
        return { [field]: { contains: String(value), mode: 'insensitive' } };
      case 'not_contains':
        return { [field]: { not: { contains: String(value), mode: 'insensitive' } } };
      case 'starts_with':
        return { [field]: { startsWith: String(value), mode: 'insensitive' } };
      case 'ends_with':
        return { [field]: { endsWith: String(value), mode: 'insensitive' } };
      case 'in':
        return { [field]: { in: Array.isArray(value) ? value : [value] } };
      case 'not_in':
        return { [field]: { notIn: Array.isArray(value) ? value : [value] } };
      default:
        throw new Error(`Unsupported operator: ${rule.operator}`);
    }
  }

  /**
   * Converts a rules group to Prisma where clause
   */
  private static rulesGroupToPrisma(rulesGroup: RulesGroup): Prisma.CustomerWhereInput {
    const conditions = rulesGroup.rules.map(rule => this.rulesToPrismaWhere(rule));

    if (rulesGroup.op === 'AND') {
      return { AND: conditions };
    } else if (rulesGroup.op === 'OR') {
      return { OR: conditions };
    } else {
      throw new Error(`Unsupported logical operator: ${rulesGroup.op}`);
    }
  }

  /**
   * Maps rule field names to Prisma field names
   */
  private static mapFieldName(field: string): string {
    const fieldMap: Record<string, string> = {
      'total_spend': 'totalSpend',
      'visits_count': 'visitsCount',
      'last_active': 'lastActive',
      'name': 'name',
      'email': 'email',
      'phone': 'phone',
      'created_at': 'createdAt'
    };

    if (!(field in fieldMap)) {
      throw new Error(`Unsupported field: ${field}. Available fields: ${Object.keys(fieldMap).join(', ')}`);
    }

    return fieldMap[field];
  }

  /**
   * Converts rule value to appropriate type for database query
   */
  private static convertValue(value: any, field: string): any {
    const dateFields = ['last_active', 'created_at'];
    
    if (dateFields.includes(field)) {
      // Convert to Date object for date comparisons
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    }

    const numericFields = ['total_spend', 'visits_count'];
    if (numericFields.includes(field)) {
      // Convert to number for numeric comparisons
      return Number(value);
    }

    return value;
  }

  /**
   * Gets the count of customers matching the rules
   */
  static async getAudienceCount(
    prisma: any, 
    rules: RulesGroup | Rule
  ): Promise<number> {
    try {
      const whereClause = this.rulesToPrismaWhere(rules);
      return await prisma.customer.count({ where: whereClause });
    } catch (error) {
      console.error('Error getting audience count:', error);
      throw new Error(`Failed to get audience count: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Gets customers matching the rules with pagination
   */
  static async getAudience(
    prisma: any,
    rules: RulesGroup | Rule,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    customers: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const whereClause = this.rulesToPrismaWhere(rules);
      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.customer.count({ where: whereClause })
      ]);

      return {
        customers,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting audience:', error);
      throw new Error(`Failed to get audience: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validates that rules can be converted to Prisma where clause
   */
  static validateRulesForSql(rules: RulesGroup | Rule): { isValid: boolean; error?: string } {
    try {
      this.rulesToPrismaWhere(rules);
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  /**
   * Generates SQL query string for debugging (SQLite format)
   */
  static rulesToSqlString(rules: RulesGroup | Rule): string {
    if ('field' in rules) {
      return this.singleRuleToSql(rules);
    } else {
      return this.rulesGroupToSql(rules);
    }
  }

  private static singleRuleToSql(rule: Rule): string {
    const field = this.mapFieldName(rule.field);
    const value = this.convertValue(rule.value, rule.field);
    
    let sqlValue: string;
    if (typeof value === 'string') {
      sqlValue = `'${value.replace(/'/g, "''")}'`;
    } else if (value instanceof Date) {
      sqlValue = `'${value.toISOString()}'`;
    } else {
      sqlValue = String(value);
    }

    switch (rule.operator) {
      case '=':
        return `${field} = ${sqlValue}`;
      case '!=':
        return `${field} != ${sqlValue}`;
      case '>':
        return `${field} > ${sqlValue}`;
      case '>=':
        return `${field} >= ${sqlValue}`;
      case '<':
        return `${field} < ${sqlValue}`;
      case '<=':
        return `${field} <= ${sqlValue}`;
      case 'contains':
        return `LOWER(${field}) LIKE LOWER('%${String(value).replace(/'/g, "''")}%')`;
      case 'not_contains':
        return `LOWER(${field}) NOT LIKE LOWER('%${String(value).replace(/'/g, "''")}%')`;
      case 'starts_with':
        return `LOWER(${field}) LIKE LOWER('${String(value).replace(/'/g, "''")}%')`;
      case 'ends_with':
        return `LOWER(${field}) LIKE LOWER('%${String(value).replace(/'/g, "''")}')`;
      case 'in':
        const inValues = Array.isArray(value) ? value : [value];
        const inSqlValues = inValues.map(v => 
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v)
        ).join(', ');
        return `${field} IN (${inSqlValues})`;
      case 'not_in':
        const notInValues = Array.isArray(value) ? value : [value];
        const notInSqlValues = notInValues.map(v => 
          typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : String(v)
        ).join(', ');
        return `${field} NOT IN (${notInSqlValues})`;
      default:
        throw new Error(`Unsupported operator: ${rule.operator}`);
    }
  }

  private static rulesGroupToSql(rulesGroup: RulesGroup): string {
    const conditions = rulesGroup.rules.map(rule => this.rulesToSqlString(rule));
    
    if (rulesGroup.op === 'AND') {
      return `(${conditions.join(' AND ')})`;
    } else if (rulesGroup.op === 'OR') {
      return `(${conditions.join(' OR ')})`;
    } else {
      throw new Error(`Unsupported logical operator: ${rulesGroup.op}`);
    }
  }
}
