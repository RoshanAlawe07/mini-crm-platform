import { Router } from 'express';
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getCampaignAudience,
  launchCampaign,
  getCampaignStats,
  sendCampaign
} from '../controllers/campaigns.controller';

const router = Router();

// Campaign CRUD operations
router.post('/', createCampaign);
router.get('/', getAllCampaigns);
router.get('/:id', getCampaignById);
router.put('/:id', updateCampaign);
router.delete('/:id', deleteCampaign);

// Campaign-specific operations
router.get('/:id/audience', getCampaignAudience);
router.post('/:id/launch', launchCampaign);
router.post('/:id/send', sendCampaign);
router.get('/:id/stats', getCampaignStats);

export default router;

