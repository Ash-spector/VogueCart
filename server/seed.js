import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Cart from './models/Cart.js';

dotenv.config();

// Unsplash image helper
const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOES = ['6', '7', '8', '9', '10', '11'];

const products = [
  // MEN
  { name: 'Oversized Cotton T-Shirt', brand: 'UrbanWear', category: 'men', price: 1299, discountPrice: 799, sizes: CLOTHING, colors: ['Black', 'White', 'Brown'], stock: 50, rating: 4.5, numReviews: 120,
    images: [img('photo-1521572163474-6864f9cf17ab'), img('photo-1583743814966-8936f5b7be1a')],
    description: 'A comfortable oversized t-shirt made from 100% premium cotton, with a relaxed fit and all-day comfort. Perfect for layering or wearing on its own.' },
  { name: 'Classic Denim Jacket', brand: 'Levis', category: 'men', price: 2499, discountPrice: 1299, sizes: CLOTHING, colors: ['Blue', 'Black'], stock: 30, rating: 4.2, numReviews: 86,
    images: [img('photo-1576995853123-5a10305d93c0'), img('photo-1551028719-00167b16eac5')],
    description: 'A timeless denim jacket in washed indigo with a structured collar and button front. Built to layer over everything.' },
  { name: 'Slim Fit Oxford Shirt', brand: 'H&M', category: 'men', price: 1499, discountPrice: 999, sizes: CLOTHING, colors: ['White', 'Blue'], stock: 40, rating: 4.3, numReviews: 64,
    images: [img('photo-1602810318383-e386cc2a3ccf'), img('photo-1596755094514-f87e34085b2c')],
    description: 'A crisp slim-fit Oxford shirt in breathable cotton. Smart enough for the office, relaxed enough for the weekend.' },
  { name: 'Relaxed Cargo Pants', brand: 'Zara', category: 'men', price: 1499, discountPrice: 999, sizes: CLOTHING, colors: ['Green', 'Brown', 'Black'], stock: 35, rating: 4.4, numReviews: 52,
    images: [img('photo-1624378439575-d8705ad7ae80'), img('photo-1517438476312-10d79c077509')],
    description: 'Relaxed-fit cargo pants with utility pockets and an adjustable hem. Durable, roomy and built for daily wear.' },
  { name: 'Summer Linen Shirt', brand: 'Zara', category: 'men', price: 1299, discountPrice: 999, sizes: CLOTHING, colors: ['White', 'Blue'], stock: 28, rating: 4.3, numReviews: 41,
    images: [img('photo-1598033129183-c4f50c736f10'), img('photo-1589310243389-96a5483213a8')],
    description: 'A lightweight linen shirt that stays cool in warm weather. Loose cut with a soft, natural drape.' },
  { name: 'Classic Black Hoodie', brand: 'Nike', category: 'men', price: 2999, discountPrice: 2199, sizes: CLOTHING, colors: ['Black', 'White'], stock: 45, rating: 4.6, numReviews: 98,
    images: [img('photo-1556821840-3a63f95609a7'), img('photo-1620799140408-edc6dcb6d633')],
    description: 'A heavyweight fleece hoodie with a kangaroo pocket and ribbed cuffs. Warm, soft and easy to style.' },

  // WOMEN
  { name: 'Women Floral Dress', brand: 'Zara', category: 'women', price: 1899, discountPrice: 1299, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Red', 'White'], stock: 25, rating: 4.6, numReviews: 74,
    images: [img('photo-1572804013309-59a88b7e92f1'), img('photo-1496747611176-843222e1e57c')],
    description: 'A flowing midi dress in a soft floral print with a flattering waist and light, breathable fabric.' },
  { name: 'Women Oversized Blazer', brand: 'H&M', category: 'women', price: 2999, discountPrice: 1799, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Brown'], stock: 20, rating: 4.3, numReviews: 58,
    images: [img('photo-1591369822096-ffd140ec948f'), img('photo-1548624313-0396c75e4b1a')],
    description: 'A tailored oversized blazer with structured shoulders. Dress it up for work or down with jeans.' },
  { name: 'High-Waist Wide Leg Jeans', brand: 'Levis', category: 'women', price: 2799, discountPrice: 1999, sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Blue', 'Black'], stock: 32, rating: 4.4, numReviews: 67,
    images: [img('photo-1541099649105-f69ad21f3246'), img('photo-1584370848010-d7fe6bc767ec')],
    description: 'High-rise wide-leg jeans in rigid denim with a clean, modern silhouette.' },
  { name: 'Ribbed Knit Top', brand: 'H&M', category: 'women', price: 899, sizes: ['XS', 'S', 'M', 'L'], colors: ['White', 'Black', 'Brown'], stock: 60, rating: 4.1, numReviews: 39,
    images: [img('photo-1618354691373-d851c5c3a990'), img('photo-1434389677669-e08b4cac3105')],
    description: 'A soft ribbed knit top with a fitted cut. A wardrobe basic that goes with everything.' },

  // SHOES
  { name: 'Classic Sneakers', brand: 'Adidas', category: 'shoes', price: 3499, discountPrice: 2499, sizes: SHOES, colors: ['White', 'Black'], stock: 40, rating: 4.4, numReviews: 143,
    images: [img('photo-1549298916-b41d501d3772'), img('photo-1542291026-7eec264c27ff')],
    description: 'Clean low-top sneakers with a cushioned insole and a durable rubber outsole. Easy to wear every day.' },
  { name: 'Running Performance Shoes', brand: 'Nike', category: 'shoes', price: 5499, discountPrice: 4299, sizes: SHOES, colors: ['Red', 'Black', 'White'], stock: 30, rating: 4.7, numReviews: 210,
    images: [img('photo-1542291026-7eec264c27ff'), img('photo-1460353581641-37baddab0fa2')],
    description: 'Lightweight running shoes with responsive cushioning and a breathable mesh upper.' },
  { name: 'Leather Chelsea Boots', brand: 'Zara', category: 'shoes', price: 4999, discountPrice: 3799, sizes: SHOES, colors: ['Brown', 'Black'], stock: 18, rating: 4.5, numReviews: 45,
    images: [img('photo-1638247025967-b4e38f787b76'), img('photo-1605812860427-4024433a70fd')],
    description: 'Polished leather Chelsea boots with elastic side panels and a stacked heel.' },

  // ACCESSORIES
  { name: 'Leather Crossbody Bag', brand: 'Zara', category: 'accessories', price: 3499, discountPrice: 2499, sizes: [], colors: ['Brown', 'Black'], stock: 22, rating: 4.7, numReviews: 89,
    images: [img('photo-1548036328-c9fa89d128fa'), img('photo-1584917865442-de89df76afd3')],
    description: 'A compact crossbody bag in genuine leather with an adjustable strap and secure zip closure.' },
  { name: 'Minimal Watch', brand: 'Titan', category: 'accessories', price: 4999, discountPrice: 3499, sizes: [], colors: ['Brown', 'Black'], stock: 15, rating: 4.9, numReviews: 132,
    images: [img('photo-1524592094714-0f0654e20314'), img('photo-1523275335684-37898b6baf30')],
    description: 'A minimalist analog watch with a slim case, sapphire-style glass and a genuine leather strap.' },
  { name: 'Classic Aviator Sunglasses', brand: 'Ray-Ban', category: 'accessories', price: 3999, discountPrice: 2999, sizes: [], colors: ['Black', 'Brown'], stock: 26, rating: 4.5, numReviews: 77,
    images: [img('photo-1572635196237-14b3f281503f'), img('photo-1511499767150-a48a237f0083')],
    description: 'Timeless aviator sunglasses with UV400 protection and a lightweight metal frame.' },
  { name: 'Leather Belt', brand: 'Levis', category: 'accessories', price: 1299, sizes: [], colors: ['Brown', 'Black'], stock: 50, rating: 4.2, numReviews: 33,
    images: [img('photo-1553062407-98eeb64c6a62'), img('photo-1624222247344-550fb60583dc')],
    description: 'A full-grain leather belt with a brushed metal buckle. Simple, sturdy and made to last.' },
];

const importData = async () => {
  await connectDB();
  try {
    await Order.deleteMany();
    await Cart.deleteMany();
    await Product.deleteMany();
    await User.deleteMany({ email: 'admin@voguecart.com' });

    await User.create({
      name: 'VogueCart Admin',
      email: 'admin@voguecart.com',
      password: 'admin123',
      role: 'admin',
    });

    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products and the admin user`);
    console.log('Admin login -> admin@voguecart.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error(`Seed failed: ${err.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  await connectDB();
  await Order.deleteMany();
  await Cart.deleteMany();
  await Product.deleteMany();
  console.log('Products, carts and orders removed');
  process.exit(0);
};

process.argv[2] === '-d' ? destroyData() : importData();