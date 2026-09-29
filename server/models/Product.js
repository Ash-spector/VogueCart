import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    brand: { type: String, required: [true, 'Brand is required'], trim: true },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: ['men', 'women', 'shoes', 'accessories'], message: 'Invalid category' },
    },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    discountPrice: { type: Number, min: [0, 'Discount price cannot be negative'] },
    images: { type: [String], validate: [(v) => v.length > 0, 'At least one image is required'] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    stock: { type: Number, required: true, min: [0, 'Stock cannot be negative'], default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// The price the customer actually pays
productSchema.virtual('finalPrice').get(function () {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

productSchema.virtual('discountPercent').get(function () {
  if (!this.discountPrice || this.discountPrice >= this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.index({ name: 'text', brand: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);