import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import { createProduct } from '../services/adminService';

export default function AddProduct() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handle = async (data) => {
    setSubmitting(true);
    try {
      await createProduct(data);
      toast.success('Product created');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Add Product</h1>
      <ProductForm onSubmit={handle} submitting={submitting} submitLabel="Create Product" />
    </div>
  );
}