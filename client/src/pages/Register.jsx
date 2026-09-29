import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FormField, { inputClass } from '../components/FormField';

const authImage =
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80';

export default function Register() {
  const { register: registerUser, user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  if (user) return <Navigate to="/" replace />;

  const onSubmit = async ({ name, email, password }) => {
    setSubmitting(true);
    try {
      const profile = await registerUser({ name, email, password });
      toast.success(`Welcome to VogueCart, ${profile.name.split(' ')[0]}!`);
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-10 sm:py-16">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-md border border-neutral-200 md:grid-cols-2">
        <div className="relative hidden md:block">
          <img src={authImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white">
            <h2 className="text-2xl font-bold">Join VogueCart</h2>
            <p className="mt-1 text-sm text-white/85">Be a part of our fashion community.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-xl font-semibold">Create an account</h1>
          <p className="mt-1 text-sm text-neutral-500">Start your fashion journey</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <FormField label="Name" error={errors.name?.message}>
              <input
                placeholder="Enter your name"
                className={inputClass}
                {...register('name', { required: 'Name is required' })}
              />
            </FormField>

            <FormField label="Email" error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please enter a valid email' },
                })}
              />
            </FormField>

            <FormField label="Password" error={errors.password?.message}>
              <input
                type="password"
                placeholder="Enter password"
                className={inputClass}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must contain at least 6 characters' },
                })}
              />
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
              <input
                type="password"
                placeholder="Confirm password"
                className={inputClass}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
              />
            </FormField>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}