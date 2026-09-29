import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import FormField, { inputClass } from '../components/FormField';

const authImage =
  'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=900&q=80';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const from = location.state?.from?.pathname;

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : from || '/'} replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const profile = await login(data);
      toast.success(`Welcome back, ${profile.name.split(' ')[0]}!`);
      navigate(profile.role === 'admin' ? '/admin' : from || '/', { replace: true });
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
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="mt-1 text-sm text-white/85">to VogueCart. Shop the latest trends.</p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-xl font-semibold">Login to your account</h1>
          <p className="mt-1 text-sm text-neutral-500">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
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
                placeholder="Enter your password"
                className={inputClass}
                {...register('password', { required: 'Password is required' })}
              />
            </FormField>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}