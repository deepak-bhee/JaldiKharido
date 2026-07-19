const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmailNotification, sendSmsNotification } = require('../utils/notifier');

// @desc    Place new order
// @route   POST /api/orders
// @access  Private
const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Validate products and calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: item.quantity
      });

      itemsPrice += product.price * item.quantity;
      // Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    const shippingPrice = itemsPrice > 499 ? 0 : 49;
    const totalAmount = itemsPrice + shippingPrice;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      itemsPrice,
      shippingPrice,
      totalAmount
    });

    // Simulate SMS notification sendout to the order phone number
    console.log(`
┌────────────────────────────────────────────────────────┐
│  ✉️  SMS NOTIFICATION SENT                             │
├────────────────────────────────────────────────────────┤
│  To: ${shippingAddress.phone}
│  Message: JaldiKharidoo: Your order #${order._id.toString().substring(0, 8)} has
│  been placed successfully! Total: ₹${totalAmount} via ${paymentMethod || 'COD'}.
│  Track here: https://jaldi-kharido.vercel.app/orders
└────────────────────────────────────────────────────────┘
    `);

    const populatedOrder = await Order.findById(order._id).populate('user', 'name email');

    // Trigger real email and SMS notifications (non-blocking)
    const emailSubject = `Order Placed Successfully - #${order._id.toString().substring(0, 8)}`;
    const emailText = `Hi ${populatedOrder.user?.name},\n\nYour order #${order._id} has been placed successfully! Total Amount: ₹${totalAmount}. Payment Method: ${paymentMethod || 'COD'}.\n\nThank you for shopping with JaldiKharidoo! 🚀`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #334155;">
        <h2 style="color: #f97316; margin-top: 0;">Order Placed Successfully! 🎉</h2>
        <p>Hi <strong>${populatedOrder.user?.name}</strong>,</p>
        <p>Your order <strong>#${order._id}</strong> has been created. Here are your order details:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background-color: #f8fafc;">
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #475569;">Payment Method</th>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${paymentMethod || 'COD'}</td>
          </tr>
          <tr>
            <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left; font-weight: bold; color: #475569;">Total Price</th>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #f97316;">₹${totalAmount}</td>
          </tr>
        </table>
        <p style="margin-top: 20px;">We are preparing your package and will deliver it at lightning speed! 🚀</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">JaldiKharidoo Store • India's Fastest Delivery</p>
      </div>
    `;
    const smsText = `JaldiKharidoo: Order #${order._id.toString().substring(0, 8)} confirmed! Total: ₹${totalAmount} via ${paymentMethod || 'COD'}. Track here: https://jaldi-kharido.vercel.app/orders`;

    const adminEmail = process.env.SMTP_USER || 'deepakbhee2006@gmail.com';
    const customerEmail = populatedOrder.user?.email || req.user?.email;

    const dispatchTask = async () => {
      try {
        if (customerEmail) {
          await sendEmailNotification(customerEmail, emailSubject, emailText, emailHtml);
        }
        if (adminEmail && adminEmail !== customerEmail) {
          await sendEmailNotification(adminEmail, emailSubject, emailText, emailHtml);
        }
        await sendSmsNotification(shippingAddress.phone, smsText);
      } catch (err) {
        console.error('Email dispatch error:', err.message);
      }
    };

    // Await email delivery completion before returning HTTP response
    await dispatchTask();

    res.status(201).json({ success: true, order: populatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status && status !== 'all') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: orders.length, total, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    // Allow user to see own order or admin to see any
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (status === 'delivered') {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.deliveredAt = Date.now();
    }
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order stats (admin)
// @route   GET /api/orders/stats
// @access  Admin
const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check user ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    // Check status
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({ success: false, message: `Cannot cancel order after it has been ${order.status}` });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getMyOrders, getAllOrders, getOrder, updateOrderStatus, getOrderStats, cancelOrder };
