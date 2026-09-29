import { useState, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../services/orderService';
import FormField, { inputClass } from '../components/FormField';
import { Spinner } from '../components/Loader';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { user } = useAuth();
  const { cart, loading, setCartData } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const placedRef = useRef(false); // stops the "empty cart" redirect right after ordering

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { fullName: user?.name || '' } });

  if (loading) return <Spinner label="Loading checkout..." />;
  if (cart.items.length === 0 && !placedRef.current) return <Navigate to="/cart" replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const order = await placeOrder({ shippingAddress: data, paymentMethod: 'COD' });
      placedRef.current = true;
      setCartData({ ...cart, items: [], itemCount: 0, subtotal: 0, shipping: 0, total: 0 });
      toast.success('Order placed successfully!');
      navigate(`/orders/${order._id}`, { replace: true, state: { justPlaced: true } });
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-8">
      <h1 className="text-xl font-semibold sm:text-2xl">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="space-y-10 lg:col-span-2">
          <section>
            <h2 className="mb-5 text-base font-semibold">Shipping Information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Full Name" error={errors.fullName?.message}>
                <input
                  className={inputClass}
                  placeholder="Enter your name"
                  {...register('fullName', { required: 'Full name is required' })}
                />
              </FormField>
              <FormField label="Phone Number" error={errors.phone?.message}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit phone number' },
                  })}
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-base font-semibold">Shipping Address</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Address" error={errors.address?.message}>
                  <input
                    className={inputClass}
                    placeholder="House no, street, area"
                    {...register('address', { required: 'Address is required' })}
                  />
                </FormField>
              </div>
              <FormField label="City" error={errors.city?.message}>
                <input className={inputClass} placeholder="Enter city" {...register('city', { required: 'City is required' })} />
              </FormField>
              <FormField label="State" error={errors.state?.message}>
                <input className={inputClass} placeholder="Enter state" {...register('state', { required: 'State is required' })} />
              </FormField>
              <FormField label="Pincode" error={errors.pincode?.message}>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  {...register('pincode', {
                    required: 'Pincode is required',
                    pattern: { value: /^\d{6}$/, message: 'Pincode must be 6 digits' },
                  })}
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-base font-semibold">Payment Method</h2>
            <label className="flex items-center gap-3 rounded-md border border-neutral-900 p-4">
              <input type="radio" checked readOnly className="accent-black" />
              <div>
                <p className="text-sm font-medium">Cash on Delivery</p>
                <p className="text-xs text-neutral-500">Pay when you receive your order</p>
              </div>
            </label>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-md border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-base font-semibold">Order Summary</h2>
          <ul className="mt-5 space-y-4">
            {cart.items.map((i) => (
              <li key={i._id} className="flex gap-3">
                <img src={i.product.image} alt="" className="h-16 w-14 rounded object-cover" />
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium">{i.product.name}</p>
                  <p className="text-xs text-neutral-500">
                    {[i.size, i.color].filter(Boolean).join(', ')} · Qty {i.quantity}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-3 border-t border-neutral-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-600">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-600">Shipping</dt>
              <dd>{cart.shipping === 0 ? <span className="text-sale">Free</span> : formatPrice(cart.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatPrice(cart.total)}</dd>
            </div>
          </dl>

          <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full py-3">
            {submitting ? 'Placing order...' : 'Place Order'}
          </button>
        </aside>
      </form>
    </div>
  );
}