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

/**
 * @swagger
 * /api/segments:
 *   post:
 *     summary: Create a new segment
 *     tags: [Segments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Segment name
 *               description:
 *                 type: string
 *                 description: Segment description
 *               rules:
 *                 type: object
 *                 description: Segment rules
 *     responses:
 *       201:
 *         description: Segment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', createSegment);

/**
 * @swagger
 * /api/segments:
 *   get:
 *     summary: Get all segments
 *     tags: [Segments]
 *     responses:
 *       200:
 *         description: List of segments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Segment'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getAllSegments);

/**
 * @swagger
 * /api/segments/{id}:
 *   get:
 *     summary: Get segment by ID
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Segment'
 *       404:
 *         description: Segment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getSegmentById);

/**
 * @swagger
 * /api/segments/{id}:
 *   put:
 *     summary: Update segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Segment'
 *     responses:
 *       200:
 *         description: Segment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Segment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', updateSegment);

/**
 * @swagger
 * /api/segments/{id}:
 *   delete:
 *     summary: Delete segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: Segment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Segment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', deleteSegment);

/**
 * @swagger
 * /api/segments/{id}/customers:
 *   get:
 *     summary: Get customers in segment
 *     tags: [Segments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Segment ID
 *     responses:
 *       200:
 *         description: List of customers in segment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Segment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id/customers', getSegmentCustomers);

// Additional utility endpoints
router.post('/validate-rules', validateRules);
router.post('/audience-count', getAudienceCount);
router.post('/generate-sql', generateSqlQuery);
router.post('/ai-helper', aiHelperConvert);
router.post('/preview', previewAudience);
router.post('/matching-customers', getMatchingCustomers);

export default router;
