import Product from '../models/Product.js';

const CATEGORIES = ['men', 'women', 'shoes', 'accessories'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Validate and normalize incoming product data (used by create and update)
const validateProductBody = (body, { partial = false } = {}) => {
  const errors = [];
  const has = (k) => body[k] !== undefined;

  if (!partial || has('name')) if (!body.name?.trim()) errors.push('Product name is required');
  if (!partial || has('description')) if (!body.description?.trim()) errors.push('Description is required');
  if (!partial || has('brand')) if (!body.brand?.trim()) errors.push('Brand is required');
  if (!partial || has('category')) {
    if (!CATEGORIES.includes(String(body.category || '').toLowerCase())) errors.push('Invalid category');
  }
  if (!partial || has('price')) {
    if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) < 0)
      errors.push('Price must be a number and cannot be negative');
  }
  if (has('discountPrice') && body.discountPrice !== null && body.discountPrice !== '') {
    const dp = Number(body.discountPrice);
    if (isNaN(dp) || dp < 0) errors.push('Discount price cannot be negative');
    else if (body.price !== undefined && dp >= Number(body.price))
      errors.push('Discount price must be less than the price');
  }
  if (!partial || has('stock')) {
    if (body.stock === undefined || isNaN(Number(body.stock)) || Number(body.stock) < 0)
      errors.push('Stock must be a number and cannot be negative');
  }
  if (!partial || has('images')) {
    if (!Array.isArray(body.images) || body.images.length === 0) errors.push('At least one image is required');
  }
  return errors;
};

// GET /api/products
// ?search=&category=&brand=&minPrice=&maxPrice=&size=&color=&sort=&page=&limit=
export const getProducts = async (req, res) => {
  const { search, category, brand, minPrice, maxPrice, size, color, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);

  const filter = {};

  if (search?.trim()) {
    const rx = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { category: rx }];
  }
  if (category && category !== 'all') filter.category = category.toLowerCase();

  // multi-value filters: ?brand=Nike,Zara  ?size=M,L  ?color=Black,Blue
  const list = (v) => String(v).split(',').map((x) => x.trim()).filter(Boolean);
  if (brand) filter.brand = { $in: list(brand).map((b) => new RegExp(`^${escapeRegex(b)}$`, 'i')) };
  if (size) filter.sizes = { $in: list(size).map((s) => s.toUpperCase()) };
  if (color) filter.colors = { $in: list(color).map((c) => new RegExp(`^${escapeRegex(c)}$`, 'i')) };

  // Price filter runs on the price the customer actually pays
  const min = minPrice !== undefined && minPrice !== '' ? Number(minPrice) : null;
  const max = maxPrice !== undefined && maxPrice !== '' ? Number(maxPrice) : null;
  if (min !== null || max !== null) {
    const range = {};
    if (min !== null && !isNaN(min)) range.$gte = min;
    if (max !== null && !isNaN(max)) range.$lte = max;
    if (Object.keys(range).length) {
      filter.$expr = undefined; // placeholder removed below
      delete filter.$expr;
      filter.$and = [
        {
          $expr: {
            $and: [
              ...(range.$gte !== undefined
                ? [{ $gte: [{ $ifNull: ['$discountPrice', '$price'] }, range.$gte] }]
                : []),
              ...(range.$lte !== undefined
                ? [{ $lte: [{ $ifNull: ['$discountPrice', '$price'] }, range.$lte] }]
                : []),
            ],
          },
        },
      ];
    }
  }

  const sortMap = {
    newest: { createdAt: -1 },
    'price-low': { discountPrice: 1, price: 1 },
    'price-high': { discountPrice: -1, price: -1 },
    rating: { rating: -1, numReviews: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortBy).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
};

// GET /api/products/filters  -> data for the Shop sidebar (brands with counts, etc.)
export const getFilterOptions = async (req, res) => {
  const brands = await Product.aggregate([
    { $group: { _id: '$brand', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
  ]);
  res.json({ brands: brands.map((b) => ({ name: b._id, count: b.count })) });
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
};

// POST /api/products  (admin)
export const createProduct = async (req, res) => {
  const errors = validateProductBody(req.body);
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }
  const { name, description, brand, category, price, discountPrice, images, sizes, colors, stock } = req.body;
  const product = await Product.create({
    name,
    description,
    brand,
    category: category.toLowerCase(),
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    images,
    sizes: sizes || [],
    colors: colors || [],
    stock: Number(stock),
  });
  res.status(201).json(product);
};

// PUT /api/products/:id  (admin)
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Validate the merged result so price/discount rules hold even on partial updates
  const merged = { price: product.price, ...req.body };
  const errors = validateProductBody(merged, { partial: true });
  if (errors.length) {
    res.status(400);
    throw new Error(errors.join(', '));
  }

  const fields = ['name', 'description', 'brand', 'category', 'price', 'discountPrice', 'images', 'sizes', 'colors', 'stock'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  if (product.category) product.category = product.category.toLowerCase();
  if (req.body.discountPrice === '' || req.body.discountPrice === null) product.discountPrice = undefined;

  const updated = await product.save();
  res.json(updated);
};

// DELETE /api/products/:id  (admin)
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
};