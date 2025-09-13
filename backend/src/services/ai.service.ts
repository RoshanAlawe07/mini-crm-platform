import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface MessageSuggestionRequest {
  objective: string;
  audienceAttributes?: {
    segmentName?: string;
    customerType?: string;
    totalSpend?: number;
    lastActive?: string;
    visitsCount?: number;
  };
  campaignType?: 'promotional' | 'reengagement' | 'announcement' | 'reminder';
  tone?: 'friendly' | 'professional' | 'urgent' | 'casual';
}

export interface MessageSuggestion {
  id: string;
  text: string;
  tone: string;
  reasoning: string;
}

export class AIService {
  /**
   * Generate AI-powered message suggestions based on campaign context
   */
  static async generateMessageSuggestions(request: MessageSuggestionRequest): Promise<MessageSuggestion[]> {
    try {
      const { objective, audienceAttributes, campaignType = 'promotional', tone = 'friendly' } = request;
      
      // For now, we'll use a rule-based approach to generate suggestions
      // In a real implementation, this would integrate with OpenAI, Claude, or similar AI service
      const suggestions = this.generateRuleBasedSuggestions(objective, audienceAttributes, campaignType, tone);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating message suggestions:', error);
      throw new Error('Failed to generate message suggestions');
    }
  }

  /**
   * Rule-based message generation (placeholder for AI integration)
   * In production, this would call an external AI service
   */
  private static generateRuleBasedSuggestions(
    objective: string,
    audienceAttributes?: MessageSuggestionRequest['audienceAttributes'],
    campaignType?: string,
    tone?: string
  ): MessageSuggestion[] {
    const suggestions: MessageSuggestion[] = [];
    
    // Extract key information from objective
    const isFestive = /diwali|holiday|festival|celebration|christmas|new year/i.test(objective);
    const isSale = /sale|discount|offer|deal|promotion/i.test(objective);
    const isReengagement = /inactive|reconnect|miss|come back|return/i.test(objective);
    const isHighValue = audienceAttributes?.totalSpend && audienceAttributes.totalSpend > 1000;
    const isFrequent = audienceAttributes?.visitsCount && audienceAttributes.visitsCount > 5;

    // Generate suggestions based on context
    if (isFestive && isSale) {
      suggestions.push({
        id: '1',
        text: `Celebrate ${this.extractFestivalName(objective)} with us! 🎉 Get 20% off on your next order.`,
        tone: 'friendly',
        reasoning: 'Festive sale message with emoji and discount'
      });
      
      suggestions.push({
        id: '2',
        text: `This ${this.extractFestivalName(objective)}, enjoy exclusive savings on your favorite products.`,
        tone: 'professional',
        reasoning: 'Professional festive promotion message'
      });
    }

    if (isReengagement) {
      suggestions.push({
        id: '3',
        text: 'We miss you! This festive season, enjoy exclusive savings on your favorite products.',
        tone: 'friendly',
        reasoning: 'Reengagement message with festive context'
      });
      
      suggestions.push({
        id: '4',
        text: 'Your loyalty matters. Reconnect this festive season with special offers just for you!',
        tone: 'professional',
        reasoning: 'Professional reengagement with loyalty emphasis'
      });
    }

    if (isHighValue) {
      suggestions.push({
        id: '5',
        text: 'As a valued customer, enjoy VIP access to our exclusive offers and early bird discounts.',
        tone: 'professional',
        reasoning: 'VIP treatment for high-value customers'
      });
    }

    if (isFrequent) {
      suggestions.push({
        id: '6',
        text: 'Thanks for being such a loyal customer! Here\'s a special thank you offer just for you.',
        tone: 'friendly',
        reasoning: 'Appreciation message for frequent customers'
      });
    }

    // Generic suggestions based on campaign type
    if (suggestions.length === 0) {
      suggestions.push({
        id: '7',
        text: `Don't miss out! ${objective} - Limited time offer available now.`,
        tone: 'urgent',
        reasoning: 'Generic urgent promotional message'
      });
      
      suggestions.push({
        id: '8',
        text: `We have something special for you! ${objective} - Check it out today.`,
        tone: 'friendly',
        reasoning: 'Generic friendly promotional message'
      });
    }

    // Ensure we have at least 2-3 suggestions
    while (suggestions.length < 2) {
      suggestions.push({
        id: `${suggestions.length + 1}`,
        text: `Special offer: ${objective} - Act now and save!`,
        tone: 'professional',
        reasoning: 'Fallback promotional message'
      });
    }

    return suggestions.slice(0, 3); // Return maximum 3 suggestions
  }

  /**
   * Extract festival name from objective text
   */
  private static extractFestivalName(objective: string): string {
    const festivals = ['Diwali', 'Christmas', 'New Year', 'Holiday', 'Festival'];
    for (const festival of festivals) {
      if (objective.toLowerCase().includes(festival.toLowerCase())) {
        return festival;
      }
    }
    return 'Holiday';
  }

  /**
   * Get audience insights for better message personalization
   */
  static async getAudienceInsights(segmentId: string): Promise<any> {
    try {
      const segment = await prisma.segment.findUnique({
        where: { id: segmentId }
      });

      if (!segment) {
        throw new Error('Segment not found');
      }

      // Parse segment rules to get audience data
      const rules = JSON.parse(segment.rulesJson);
      
      // For now, return basic segment info
      // In a real implementation, you would use the rules to query customers
      return {
        segmentName: segment.name,
        customerCount: 0, // Would be calculated from rules
        averageSpend: 0,
        averageVisits: 0,
        averageDaysSinceLastActive: 0,
        customerType: 'regular'
      };
    } catch (error) {
      console.error('Error getting audience insights:', error);
      throw new Error('Failed to get audience insights');
    }
  }
}
