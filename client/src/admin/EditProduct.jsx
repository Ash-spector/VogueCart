import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import { Spinner } from '../components/Loader';
import { getProduct } from '../services/productService';
import { updateProduct } from '../services/adminService';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProduct(id).then(setProduct).catch((err) => setError(err.userMessage));
  }, [id]);

  const handle = async (data) => {
    setSubmitting(true);
    try {
      await updateProduct(id, data);
      toast.success('Product updated');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p className="rounded-md bg-red-50 p-4 text-sm text-red-600">{error}</p>;
  if (!product) return <Spinner label="Loading product..." />;

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Edit Product</h1>
      <ProductForm initial={product} onSubmit={handle} submitting={submitting} submitLabel="Save Changes" />
    </div>
  );
}