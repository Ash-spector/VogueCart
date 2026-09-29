import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true }, // e.g. VC10245
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true }, // price at time of purchase
        quantity: { type: Number, required: true, min: 1 },
        size: String,
        color: String,
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['COD'], default: 'COD' }, // add 'Razorpay' / 'Stripe' later
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Placed',
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Human-friendly order number: VC10001, VC10002, ...
orderSchema.pre('validate', async function () {
  if (this.orderNumber) return;
  const count = await mongoose.model('Order').countDocuments();
  this.orderNumber = `VC${10001 + count}`;
});

export default mongoose.model('Order', orderSchema);
