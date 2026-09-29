import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import FormField, { inputClass } from '../components/FormField';
import { COLOR_HEX } from '../utils/colors';

const CATEGORIES = ['men', 'women', 'shoes', 'accessories'];
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11'];
const COLOR_OPTIONS = Object.keys(COLOR_HEX);

function Chips({ options, selected, onToggle, colors }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors ${
              on ? 'border-black bg-black text-white' : 'border-neutral-300 hover:border-black'
            }`}
          >
            {colors && <span className="h-3 w-3 rounded-full border border-neutral-300" style={{ backgroundColor: COLOR_HEX[o] }} />}
            {o}
          </button>
        );
      })}
    </div>
  );
}

const toggle = (list, item) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export default function ProductForm({ initial, onSubmit, submitting, submitLabel }) {
  const [sizes, setSizes] = useState(initial?.sizes || []);
  const [colors, setColors] = useState(initial?.colors || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initial?.name || '',
      description: initial?.description || '',
      brand: initial?.brand || '',
      category: initial?.category || 'men',
      price: initial?.price ?? '',
      discountPrice: initial?.discountPrice ?? '',
      stock: initial?.stock ?? '',
      images: (initial?.images || []).join('\n'),
    },
  });

  const submit = (d) =>
    onSubmit({
      name: d.name.trim(),
      description: d.description.trim(),
      brand: d.brand.trim(),
      category: d.category,
      price: Number(d.price),
      discountPrice: d.discountPrice === '' ? null : Number(d.discountPrice),
      stock: Number(d.stock),
      images: d.images.split('\n').map((s) => s.trim()).filter(Boolean),
      sizes,
      colors,
    });

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="max-w-3xl space-y-6 rounded-md border border-neutral-200 bg-white p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Product Name" error={errors.name?.message}>
          <input className={inputClass} {...register('name', { required: 'Product name is required' })} />
        </FormField>
        <FormField label="Brand" error={errors.brand?.message}>
          <input className={inputClass} {...register('brand', { required: 'Brand is required' })} />
        </FormField>
      </div>

      <FormField label="Description" error={errors.description?.message}>
        <textarea rows={4} className={inputClass} {...register('description', { required: 'Description is required' })} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-4">
        <FormField label="Category" error={errors.category?.message}>
          <select className={`${inputClass} capitalize`} {...register('category', { required: true })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Price (₹)" error={errors.price?.message}>
          <input
            type="number"
            min="0"
            className={inputClass}
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price cannot be negative' },
            })}
          />
        </FormField>
        <FormField label="Discount Price (₹)" error={errors.discountPrice?.message}>
          <input
            type="number"
            min="0"
            placeholder="Optional"
            className={inputClass}
            {...register('discountPrice', {
              min: { value: 0, message: 'Cannot be negative' },
              validate: (v) => v === '' || Number(v) < Number(watch('price')) || 'Must be less than the price',
            })}
          />
        </FormField>
        <FormField label="Stock" error={errors.stock?.message}>
          <input
            type="number"
            min="0"
            className={inputClass}
            {...register('stock', {
              required: 'Stock is required',
              min: { value: 0, message: 'Stock cannot be negative' },
            })}
          />
        </FormField>
      </div>

      <FormField label="Image URLs (one per line, first is the main image)" error={errors.images?.message}>
        <textarea
          rows={3}
          placeholder="https://images.unsplash.com/..."
          className={inputClass}
          {...register('images', {
            validate: (v) => {
              const urls = v.split('\n').map((s) => s.trim()).filter(Boolean);
              if (urls.length === 0) return 'At least one image is required';
              return urls.every((u) => /^https?:\/\//.test(u)) || 'Every image must be a valid http(s) URL';
            },
          })}
        />
      </FormField>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Sizes <span className="font-normal text-neutral-400">(leave empty for accessories)</span></p>
        <Chips options={SIZE_OPTIONS} selected={sizes} onToggle={(s) => setSizes((l) => toggle(l, s))} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-700">Colors</p>
        <Chips options={COLOR_OPTIONS} selected={colors} onToggle={(c) => setColors((l) => toggle(l, c))} colors />
      </div>

      <div className="flex gap-3 border-t border-neutral-100 pt-6">
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Saving...' : submitLabel}
        </button>
        <Link to="/admin/products" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}