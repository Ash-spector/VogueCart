import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const products = await Product.find();
for (const p of products) {
  for (const url of p.images) {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(res.ok ? 'OK  ' : `FAIL ${res.status}`, p.name, '-', url.slice(34, 70));
  }
}
await mongoose.disconnect();
