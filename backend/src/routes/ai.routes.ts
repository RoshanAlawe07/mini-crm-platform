import { Router } from 'express';
import { suggestMessages, getAudienceInsights } from '../controllers/ai.controller';

const router = Router();

// AI-powered message suggestions
router.post('/message-suggest', suggestMessages);

// Get audience insights for personalization
router.get('/audience-insights/:segmentId', getAudienceInsights);

export default router;
