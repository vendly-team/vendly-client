import { useState } from 'react';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';

const ProfileInfoPage = () => {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', email: user?.email || '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success('Profile updated successfully');
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">My Information</h1>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-sm font-medium">First Name</label><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
          <div><label className="text-sm font-medium">Last Name</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
        </div>
        <div><label className="text-sm font-medium">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
        <div><label className="text-sm font-medium">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-sm mt-1" /></div>
        <button type="submit" className="h-11 px-8 bg-accent text-accent-foreground rounded-lg font-semibold text-sm">Save Changes</button>
      </form>
    </div>
  );
};

export default ProfileInfoPage;
