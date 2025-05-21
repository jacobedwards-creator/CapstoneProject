import express from 'express';
import { createOrder, getOrders, getOrderById } from '../database/queries/order.queries.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();


router.use(authMiddleware);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;