import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/shared/store/authStore';
import { toast } from 'sonner';

const ProfileInfoPage = () => {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', email: user?.email || '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    toast.success(t('profile.success.updated'));
  };

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-[-0.022em] leading-[1.1] font-display text-foreground mb-6">{t('profile.myInfo')}</h1>
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-lg">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-[13px] font-medium tracking-[-0.006em]">{t('auth.firstName')}</label><input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" /></div>
          <div><label className="text-[13px] font-medium tracking-[-0.006em]">{t('auth.lastName')}</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" /></div>
        </div>
        <div><label className="text-[13px] font-medium tracking-[-0.006em]">{t('common.phone')}</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" /></div>
        <div><label className="text-[13px] font-medium tracking-[-0.006em]">{t('common.email')}</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full h-10 px-3 glass-input rounded-md text-[15px] font-normal tracking-[-0.011em] mt-1" /></div>
        <button type="submit" className="h-11 px-8 bg-accent text-accent-foreground rounded-lg font-semibold text-[15px] tracking-[-0.014em]">{t('profile.saveChanges')}</button>
      </form>
    </div>
  );
};

export default ProfileInfoPage;
