import { useState } from 'react';
import { Link } from 'react-router-dom';
import StorefrontLayout from '@/components/layout/StorefrontLayout';
import { toast } from 'sonner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    toast.success('If this email exists, you will receive a reset link.');
  };

  return (
    <StorefrontLayout>
      <div className="container py-12 max-w-md mx-auto animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">Forgot Password</h1>
        {!sent ? (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" />
            </div>
            <button type="submit" className="w-full h-11 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Send Reset Link</button>
            <p className="text-sm text-center"><Link to="/login" className="text-accent hover:underline">Back to Sign In</Link></p>
          </form>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-muted-foreground mb-4">If this email exists in our system, you will receive a password reset link.</p>
            <Link to="/login" className="text-accent hover:underline text-sm">Back to Sign In</Link>
          </div>
        )}
      </div>
    </StorefrontLayout>
  );
};

export default ForgotPasswordPage;
