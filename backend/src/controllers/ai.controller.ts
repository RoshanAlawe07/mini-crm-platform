import { Request, Response } from 'express';
import { AIService, MessageSuggestionRequest } from '../services/ai.service';

export async function suggestMessages(req: Request, res: Response): Promise<void> {
  try {
    const { objective, segmentId, campaignType, tone } = req.body;

    if (!objective || typeof objective !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Objective is required and must be a string'
      });
      return;
    }

    let audienceAttributes;
    
    // If segmentId is provided, get audience insights
    if (segmentId) {
      try {
        audienceAttributes = await AIService.getAudienceInsights(segmentId);
      } catch (error) {
        console.warn('Could not get audience insights:', error);
        // Continue without audience attributes
      }
    }

    const request: MessageSuggestionRequest = {
      objective: objective.trim(),
      audienceAttributes,
      campaignType,
      tone
    };

    const suggestions = await AIService.generateMessageSuggestions(request);

    res.json({
      success: true,
      data: {
        suggestions,
        context: {
          objective,
          segmentId,
          campaignType,
          tone,
          audienceInsights: audienceAttributes
        }
      }
    });
  } catch (error: any) {
    console.error('Error in suggestMessages:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate message suggestions'
    });
  }
}

export async function getAudienceInsights(req: Request, res: Response): Promise<void> {
  try {
    const { segmentId } = req.params;

    if (!segmentId) {
      res.status(400).json({
        success: false,
        error: 'Segment ID is required'
      });
      return;
    }

    const insights = await AIService.getAudienceInsights(segmentId);

    res.json({
      success: true,
      data: insights
    });
  } catch (error: any) {
    console.error('Error getting audience insights:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get audience insights'
    });
  }
}
