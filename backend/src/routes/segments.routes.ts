import { Router } from 'express';
import {
  createSegment,
  getAllSegments,
  getSegmentById,
  updateSegment,
  deleteSegment,
  getSegmentCustomers,
  validateRules,
  getAudienceCount,
  generateSqlQuery,
  aiHelperConvert,
  previewAudience,
  getMatchingCustomers
} from '../controllers/segments.controller';

const router = Router();

// Segment CRUD operations
router.post('/', createSegment);
router.get('/', getAllSegments);
router.get('/:id', getSegmentById);
router.put('/:id', updateSegment);
router.delete('/:id', deleteSegment);

// Segment-specific operations
router.get('/:id/customers', getSegmentCustomers);

// Rules validation and utilities
router.post('/validate-rules', validateRules);
router.post('/audience-count', getAudienceCount);
router.post('/generate-sql', generateSqlQuery);

// AI Helper and Preview functionality
router.post('/ai-helper', aiHelperConvert);
router.post('/preview', previewAudience);
router.post('/matching-customers', getMatchingCustomers);

export default router;
