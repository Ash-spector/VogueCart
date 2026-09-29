import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { calcShipping, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../utils/pricing.js';

// Build the cart response with live product data and totals
const buildCartResponse = async (cart) => {
  await cart.populate('items.product');

  // Drop items whose product was deleted
  const valid = cart.items.filter((i) => i.product);
  if (valid.length !== cart.items.length) {
    cart.items = valid;
    await cart.save();
  }

  const items = cart.items.map((i) => ({
    _id: i._id,
    product: {
      _id: i.product._id,
      name: i.product.name,
      brand: i.product.brand,
      image: i.product.images[0],
      finalPrice: i.product.finalPrice,
      price: i.product.price,
      stock: i.product.stock,
    },
    quantity: i.quantity,
    size: i.size,
    color: i.color,
    lineTotal: i.product.finalPrice * i.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const shipping = calcShipping(subtotal);

  return {
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal,
    shipping,
    total: subtotal + shipping,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    shippingFee: SHIPPING_FEE,
  };
};

const getOrCreateCart = async (userId) =>
  (await Cart.findOne({ user: userId })) || (await Cart.create({ user: userId, items: [] }));

// GET /api/cart
export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(await buildCartResponse(cart));
};

// POST /api/cart   { productId, quantity, size, color }
export const addToCart = async (req, res) => {
  const { productId, size, color } = req.body;
  const quantity = parseInt(req.body.quantity) || 1;

  if (quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  if (product.sizes.length > 0 && (!size || !product.sizes.includes(size))) {
    res.status(400);
    throw new Error('Please select a valid size');
  }
  if (product.colors.length > 0 && (!color || !product.colors.includes(color))) {
    res.status(400);
    throw new Error('Please select a valid color');
  }
  if (product.stock === 0) {
    res.status(400);
    throw new Error('This product is out of stock');
  }

  const cart = await getOrCreateCart(req.user._id);

  // Same product + size + color merges into one line
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && (i.size || '') === (size || '') && (i.color || '') === (color || '')
  );
  const newQty = (existing?.quantity || 0) + quantity;

  if (newQty > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} in stock`);
  }

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, quantity, size, color });

  await cart.save();
  res.status(201).json(await buildCartResponse(cart));
};

// PUT /api/cart/:itemId   { quantity }
export const updateCartItem = async (req, res) => {
  const quantity = parseInt(req.body.quantity);
  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }

  const product = await Product.findById(item.product);
  if (!product) {
    res.status(404);
    throw new Error('Product no longer available');
  }
  if (quantity > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  res.json(await buildCartResponse(cart));
};

// DELETE /api/cart/:itemId
export const removeCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.id(req.params.itemId);
  if (!item) {
    res.status(404);
    throw new Error('Cart item not found');
  }
  item.deleteOne();
  await cart.save();
  res.json(await buildCartResponse(cart));
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.json(await buildCartResponse(cart));
};