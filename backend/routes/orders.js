const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, getOrderStats, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/stats', protect, admin, getOrderStats);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.post('/', protect, placeOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
