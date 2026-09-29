import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg, statusAgg, recentOrders, recentProducts] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      // Revenue counts every order that wasn't cancelled
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.find().populate('user', 'name').sort({ createdAt: -1 }).limit(5),
      Product.find().sort({ createdAt: -1 }).limit(5),
    ]);

  const statusSummary = { Placed: 0, Confirmed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
  statusAgg.forEach((s) => (statusSummary[s._id] = s.count));

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    statusSummary,
    recentOrders,
    recentProducts,
  });
};