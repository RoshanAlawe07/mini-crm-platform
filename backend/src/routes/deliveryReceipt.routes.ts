import { Router } from 'express';
import { updateDeliveryReceipt } from '../controllers/deliveryReceipt.controller';

const router = Router();

// Delivery receipt endpoint
router.post('/', updateDeliveryReceipt);

export default router;
