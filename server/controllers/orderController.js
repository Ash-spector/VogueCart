import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { calcShipping } from '../utils/pricing.js';

const STATUSES = ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const validateAddress = (a = {}) => {
  const errors = [];
  if (!a.fullName?.trim()) errors.push('Full name is required');
  if (!/^[6-9]\d{9}$/.test(String(a.phone || '').trim())) errors.push('Enter a valid 10-digit phone number');
  if (!a.address?.trim()) errors.push('Address is required');
  if (!a.city?.trim()) errors.push('City is required');
  if (!a.state?.trim()) errors.push('State is required');
  if (!/^\d{6}$/.test(String(a.pincode || '').trim())) errors.push('Pincode must be 6 digits');
  return errors;
};

// Put stock back (used on failure and on cancellation)
const restoreStock = (items) =>
  Promise.all(items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } })));

// POST /api/orders
export const createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod = 'COD' } = req.body;

  const errors = validateAddress(shippingAddress);
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }
  if (paymentMethod !== 'COD') {
    res.status(400);
    throw new Error('Unsupported payment method');
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Your cart is empty');
  }

  // Reserve stock with atomic conditional updates (works without replica-set transactions)
  const reserved = [];
  const orderItems = [];

  try {
    for (const item of cart.items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!product) {
        const p = await Product.findById(item.product);
        res.status(400);
        throw new Error(
          !p
            ? 'A product in your cart is no longer available'
            : p.stock === 0
              ? `${p.name} is out of stock`
              : `Only ${p.stock} of ${p.name} left in stock`
        );
      }

      reserved.push({ product: product._id, quantity: item.quantity });
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.finalPrice, // price taken from the database, never from the client
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });
    }

    const itemsPrice = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingPrice = calcShipping(itemsPrice);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalAmount: itemsPrice + shippingPrice,
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    await restoreStock(reserved); // undo any stock we already took
    throw err;
  }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

// GET /api/orders/:id  (owner or admin)
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const ownerId = order.user._id.toString();
  if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not allowed to view this order');
  }
  res.json(order);
};

// GET /api/orders  (admin)
export const getAllOrders = async (req, res) => {
  const filter = STATUSES.includes(req.query.status) ? { orderStatus: req.query.status } : {};
  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

// PUT /api/orders/:id/status  (admin)
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`A ${order.orderStatus.toLowerCase()} order cannot be changed`);
  }

  if (status === 'Cancelled') await restoreStock(order.items);
  if (status === 'Delivered' && order.paymentMethod === 'COD') order.paymentStatus = 'Paid';

  order.orderStatus = status;
  await order.save();
  res.json(order);
};