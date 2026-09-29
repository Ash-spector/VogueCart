import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/authService';
import FormField, { inputClass } from '../components/FormField';
import { Spinner } from '../components/Loader';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getProfile()
      .then((p) => reset({ name: p.name, email: p.email, phone: p.phone || '' }))
      .catch((err) => toast.error(err.userMessage))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (d) => {
    setSaving(true);
    try {
      const payload = { name: d.name, phone: d.phone };
      if (d.newPassword) {
        payload.currentPassword = d.currentPassword;
        payload.newPassword = d.newPassword;
      }
      const updated = await updateProfile(payload);
      updateUser(updated);
      reset({ name: updated.name, email: updated.email, phone: updated.phone || '' });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading profile..." />;

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="page-container py-8">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200 text-lg font-semibold">
            {initials}
          </div>
          <h1 className="text-xl font-semibold">My Profile</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
          <FormField label="Name" error={errors.name?.message}>
            <input className={inputClass} {...register('name', { required: 'Name is required' })} />
          </FormField>
          <FormField label="Email">
            <input className={`${inputClass} bg-neutral-50 text-neutral-500`} disabled {...register('email')} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              className={inputClass}
              {...register('phone', {
                pattern: { value: /^([6-9]\d{9})?$/, message: 'Enter a valid 10-digit phone number' },
              })}
            />
          </FormField>

          <div className="space-y-5 border-t border-neutral-200 pt-6">
            <h2 className="text-base font-semibold">Change Password</h2>
            <FormField label="Current Password" error={errors.currentPassword?.message}>
              <input
                type="password"
                autoComplete="current-password"
                className={inputClass}
                {...register('currentPassword', {
                  validate: (v) => !watch('newPassword') || !!v || 'Enter your current password',
                })}
              />
            </FormField>
            <FormField label="New Password" error={errors.newPassword?.message}>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Leave blank to keep the same"
                className={inputClass}
                {...register('newPassword', {
                  minLength: { value: 6, message: 'Password must contain at least 6 characters' },
                })}
              />
            </FormField>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full py-3">
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}