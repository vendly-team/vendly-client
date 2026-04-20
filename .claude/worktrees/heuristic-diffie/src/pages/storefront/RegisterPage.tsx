import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';

const RegisterPage = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirmPassword: '', agree: false });
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName) e.firstName = 'Required';
    if (!form.lastName) e.lastName = 'Required';
    if (!form.phone) e.phone = 'Required';
    if (!form.email || !form.email.includes('@')) e.email = 'Valid email required';
    if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.agree) e.agree = 'You must agree to terms';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password });
    toast.success('Account created successfully!');
    navigate('/');
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <input type={type} value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
      {errors[key] && <p className="text-xs text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <StorefrontLayout>
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">Create Account</h1>
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field('First Name *', 'firstName')}
            {field('Last Name *', 'lastName')}
          </div>
          {field('Phone *', 'phone', 'tel')}
          {field('Email *', 'email', 'email')}
          {field('Password *', 'password', 'password')}
          {field('Confirm Password *', 'confirmPassword', 'password')}
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.agree} onChange={(e) => setForm({ ...form, agree: e.target.checked })} className="rounded" />
            I agree to the Terms and Conditions
          </label>
          {errors.agree && <p className="text-xs text-destructive">{errors.agree}</p>}
          <button type="submit" className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Create Account</button>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? <Link to="/login" className="text-accent hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </StorefrontLayout>
  );
};

export default RegisterPage;
